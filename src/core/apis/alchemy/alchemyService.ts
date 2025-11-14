/**
 * Alchemy API Service
 * Handles EVM token balance and metadata fetching for Ethereum, Base, and Arbitrum
 */

import axios from 'axios';
import { API_TIMEOUTS, getEndpoints, RETRY_CONFIG } from '../endpoints';
import { ApiError, calculateRetryDelay, createApiError, ErrorType, sleep } from '../errors';
import { CircuitBreaker, executeWithCircuitBreaker } from './circuitBreaker';
import {
  type AlchemyTokenBalancesRequest,
  type AlchemyTokenBalancesResponse,
  FALLBACK_TOKEN_METADATA,
  type TokenBalance,
  type TokenMetadata,
} from './types';

/**
 * Circuit breakers for each chain
 */
const circuitBreakers = {
  ethereum: new CircuitBreaker(),
  base: new CircuitBreaker(),
  arbitrum: new CircuitBreaker(),
};

/**
 * Fetch token balances with retry logic
 */
export async function fetchTokenBalances(
  endpoint: string,
  address: string,
): Promise<TokenBalance[]> {
  const request: AlchemyTokenBalancesRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'alchemy_getTokenBalances',
    params: [address],
  };

  let lastError: ApiError | null = null;

  for (let attempt = 0; attempt < RETRY_CONFIG.MAX_RETRIES; attempt++) {
    try {
      const response = await axios.post<AlchemyTokenBalancesResponse>(endpoint, request, {
        timeout: API_TIMEOUTS.DEFAULT,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Extract token balances from response
      const tokenBalances: TokenBalance[] = response.data.result.tokenBalances.map((token) => ({
        contractAddress: token.contractAddress,
        balance: token.tokenBalance,
        error: token.error,
      }));

      return tokenBalances;
    } catch (error) {
      lastError = createApiError(error);

      // Check if error is retryable
      const isRetryable =
        lastError.statusCode === 503 ||
        lastError.statusCode === 429 ||
        (lastError.statusCode && lastError.statusCode >= 500);

      // Don't retry if not retryable or last attempt
      if (!isRetryable || attempt === RETRY_CONFIG.MAX_RETRIES - 1) {
        throw lastError;
      }

      // Calculate delay with exponential backoff and jitter
      const delay = calculateRetryDelay(
        attempt,
        RETRY_CONFIG.INITIAL_DELAY,
        RETRY_CONFIG.MAX_DELAY,
        RETRY_CONFIG.JITTER_MAX,
      );

      // Wait before retrying
      await sleep(delay);
    }
  }

  // Should never reach here, but throw last error if it does
  throw lastError || new ApiError(ErrorType.UNKNOWN_ERROR, 'Failed to fetch token balances');
}

/**
 * Fetch token metadata with fast fallback
 */
export async function fetchTokenMetadata(
  endpoint: string,
  contractAddress: string,
): Promise<TokenMetadata> {
  const request = {
    jsonrpc: '2.0',
    id: 1,
    method: 'alchemy_getTokenMetadata',
    params: [contractAddress],
  };

  try {
    const response = await axios.post(endpoint, request, {
      timeout: API_TIMEOUTS.METADATA,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = response.data.result;

    // Return metadata or fallback if incomplete
    if (result && result.name && result.symbol && result.decimals !== undefined) {
      return {
        name: result.name,
        symbol: result.symbol,
        decimals: result.decimals,
        logo: result.logo,
      };
    }

    return FALLBACK_TOKEN_METADATA;
  } catch (error) {
    // Fast fallback for failed metadata requests
    return FALLBACK_TOKEN_METADATA;
  }
}

/**
 * Fetch metadata for multiple tokens in parallel
 */
export async function fetchBatchTokenMetadata(
  endpoint: string,
  contractAddresses: string[],
): Promise<Record<string, TokenMetadata>> {
  const metadataPromises = contractAddresses.map(async (address) => {
    const metadata = await fetchTokenMetadata(endpoint, address);
    return { address, metadata };
  });

  const results = await Promise.all(metadataPromises);

  // Convert array to record
  const metadataRecord: Record<string, TokenMetadata> = {};
  for (const { address, metadata } of results) {
    metadataRecord[address] = metadata;
  }

  return metadataRecord;
}

/**
 * Fetch Ethereum tokens for an address
 */
export async function fetchEthereumTokens(
  address: string,
  isTestnet: boolean = false,
): Promise<import('./types').ChainTokenData> {
  const endpoints = getEndpoints(isTestnet);
  const endpoint = endpoints.alchemy.ethereum;

  try {
    // Fetch token balances with circuit breaker protection
    const balances = await executeWithCircuitBreaker(circuitBreakers.ethereum, () =>
      fetchTokenBalances(endpoint, address),
    );

    // Filter out tokens with zero balance or errors
    const nonZeroBalances = balances.filter(
      (token) => !token.error && token.balance !== '0x0' && token.balance !== '0',
    );

    // Fetch metadata for all tokens in parallel
    const contractAddresses = nonZeroBalances.map((token) => token.contractAddress);
    const metadataRecord = await fetchBatchTokenMetadata(endpoint, contractAddresses);

    // Combine balances with metadata
    const tokensWithMetadata = nonZeroBalances.map((token) => ({
      contractAddress: token.contractAddress,
      balance: token.balance,
      metadata: metadataRecord[token.contractAddress] || FALLBACK_TOKEN_METADATA,
    }));

    return {
      chain: 'ethereum',
      tokens: tokensWithMetadata,
    };
  } catch (error) {
    const apiError = error instanceof ApiError ? error : createApiError(error);
    return {
      chain: 'ethereum',
      tokens: [],
      error: apiError.message,
    };
  }
}

/**
 * Fetch Base tokens for an address
 */
export async function fetchBaseTokens(
  address: string,
  isTestnet: boolean = false,
): Promise<import('./types').ChainTokenData> {
  const endpoints = getEndpoints(isTestnet);
  const endpoint = endpoints.alchemy.base;

  try {
    // Fetch token balances with circuit breaker protection
    const balances = await executeWithCircuitBreaker(circuitBreakers.base, () =>
      fetchTokenBalances(endpoint, address),
    );

    // Filter out tokens with zero balance or errors
    const nonZeroBalances = balances.filter(
      (token) => !token.error && token.balance !== '0x0' && token.balance !== '0',
    );

    // Fetch metadata for all tokens in parallel
    const contractAddresses = nonZeroBalances.map((token) => token.contractAddress);
    const metadataRecord = await fetchBatchTokenMetadata(endpoint, contractAddresses);

    // Combine balances with metadata
    const tokensWithMetadata = nonZeroBalances.map((token) => ({
      contractAddress: token.contractAddress,
      balance: token.balance,
      metadata: metadataRecord[token.contractAddress] || FALLBACK_TOKEN_METADATA,
    }));

    return {
      chain: 'base',
      tokens: tokensWithMetadata,
    };
  } catch (error) {
    const apiError = error instanceof ApiError ? error : createApiError(error);
    return {
      chain: 'base',
      tokens: [],
      error: apiError.message,
    };
  }
}

/**
 * Fetch Arbitrum tokens for an address
 */
export async function fetchArbitrumTokens(
  address: string,
  isTestnet: boolean = false,
): Promise<import('./types').ChainTokenData> {
  const endpoints = getEndpoints(isTestnet);
  const endpoint = endpoints.alchemy.arbitrum;

  try {
    // Fetch token balances with circuit breaker protection
    const balances = await executeWithCircuitBreaker(circuitBreakers.arbitrum, () =>
      fetchTokenBalances(endpoint, address),
    );

    // Filter out tokens with zero balance or errors
    const nonZeroBalances = balances.filter(
      (token) => !token.error && token.balance !== '0x0' && token.balance !== '0',
    );

    // Fetch metadata for all tokens in parallel
    const contractAddresses = nonZeroBalances.map((token) => token.contractAddress);
    const metadataRecord = await fetchBatchTokenMetadata(endpoint, contractAddresses);

    // Combine balances with metadata
    const tokensWithMetadata = nonZeroBalances.map((token) => ({
      contractAddress: token.contractAddress,
      balance: token.balance,
      metadata: metadataRecord[token.contractAddress] || FALLBACK_TOKEN_METADATA,
    }));

    return {
      chain: 'arbitrum',
      tokens: tokensWithMetadata,
    };
  } catch (error) {
    const apiError = error instanceof ApiError ? error : createApiError(error);
    return {
      chain: 'arbitrum',
      tokens: [],
      error: apiError.message,
    };
  }
}

/**
 * Fetch all EVM tokens for an address (parallel execution)
 */
export async function fetchAllEvmTokens(
  address: string,
  isTestnet: boolean = false,
): Promise<import('./types').ChainTokenData[]> {
  // Fetch tokens from all chains in parallel
  const [ethereumTokens, baseTokens, arbitrumTokens] = await Promise.all([
    fetchEthereumTokens(address, isTestnet),
    fetchBaseTokens(address, isTestnet),
    fetchArbitrumTokens(address, isTestnet),
  ]);

  return [ethereumTokens, baseTokens, arbitrumTokens];
}
