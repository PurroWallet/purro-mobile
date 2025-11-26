/**
 * Etherscan API Service
 * Service for fetching transaction history from Etherscan API
 */

import { type AxiosError } from 'axios';
import { getEtherscanApiKey } from '@/config/env';
import { API_TIMEOUTS, getEndpoints } from '../endpoints';
import { ApiError, ErrorType } from '../errors';
import { httpClient } from '../httpClient';
import {
  isValidAddress,
  type NextPageParams,
  type TokenTransfer,
  type TokenTransfersResponse,
  type TransactionFilter,
} from '../hyperscan/types';
import type { EtherscanApiResponse, EtherscanPageParams, EtherscanTransaction } from './types';

/**
 * Etherscan configuration constants
 */
const ETHERSCAN_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_OFFSET: 100,
  MODULE: 'account',
  ACTION: 'txlist',
  SORT: 'desc',
  START_BLOCK: 0,
  END_BLOCK: 'latest',
};

/**
 * Supported chain IDs
 */
export type SupportedChainId = 1 | 42161 | 8453 | 999;

/**
 * Chain ID to name mapping
 */
export const CHAIN_NAMES: Record<SupportedChainId, string> = {
  1: 'Ethereum',
  42161: 'Arbitrum',
  8453: 'Base',
  999: 'Hyperliquid',
};

/**
 * Etherscan Service Class
 */
class EtherscanService {
  /**
   * Get Etherscan API endpoint
   */
  private getEndpoint(): string {
    return 'https://api.etherscan.io/v2/api';
  }

  /**
   * Fetch token transfers (transactions) for an address on a specific chain
   * @param address - Wallet address
   * @param chainId - Chain ID (1: Ethereum, 42161: Arbitrum, 8453: Base, 999: Hyperliquid)
   * @param filter - Transaction filter ('from', 'to', or 'both')
   * @param nextPageParams - Pagination parameters
   * @returns Token transfers response with pagination
   */
  async fetchTokenTransfers(
    address: string,
    chainId: SupportedChainId = 999,
    filter: TransactionFilter = 'both',
    nextPageParams?: NextPageParams,
  ): Promise<TokenTransfersResponse> {
    // Validate address
    if (!isValidAddress(address)) {
      throw new ApiError(ErrorType.VALIDATION_ERROR, `Invalid address format: ${address}`);
    }

    try {
      const endpoint = this.getEndpoint();

      // Extract pagination params
      const page = nextPageParams?.page || ETHERSCAN_CONFIG.DEFAULT_PAGE;
      const offset = nextPageParams?.offset || ETHERSCAN_CONFIG.DEFAULT_OFFSET;

      const params = {
        module: ETHERSCAN_CONFIG.MODULE,
        action: ETHERSCAN_CONFIG.ACTION,
        chainid: chainId,
        address,
        startblock: ETHERSCAN_CONFIG.START_BLOCK,
        endblock: ETHERSCAN_CONFIG.END_BLOCK,
        sort: ETHERSCAN_CONFIG.SORT,
        page,
        offset,
        apikey: getEtherscanApiKey(),
      };

      const response = await httpClient.get<EtherscanApiResponse>(endpoint, {
        params,
        timeout: API_TIMEOUTS.DEFAULT,
      });

      // Check if Etherscan returned an error
      if (response.data.status === '0') {
        throw new ApiError(ErrorType.API_ERROR, response.data.message || 'Etherscan API error');
      }

      // Parse transactions
      const transactions = Array.isArray(response.data.result) ? response.data.result : [];

      // Apply filter
      const filteredTransactions = this.applyFilter(transactions, filter, address);

      // Transform to TokenTransfer format
      const items = filteredTransactions.map((tx) =>
        this.transformTransaction(tx, address, chainId),
      );

      // Calculate next page params
      const nextPage = this.calculateNextPageParams(page, offset, transactions.length);

      return {
        items,
        next_page_params: nextPage,
      };
    } catch (error) {
      throw this.handleError(error as AxiosError, 'Failed to fetch transactions from Etherscan');
    }
  }

  /**
   * Fetch transactions from all supported chains
   * @param address - Wallet address
   * @param filter - Transaction filter ('from', 'to', or 'both')
   * @returns Combined token transfers from all chains
   */
  async fetchAllChainTransfers(
    address: string,
    filter: TransactionFilter = 'both',
  ): Promise<TokenTransfersResponse> {
    const chains: SupportedChainId[] = [1, 42161, 8453, 999];

    try {
      // Fetch from all chains in parallel
      const results = await Promise.allSettled(
        chains.map((chainId) => this.fetchTokenTransfers(address, chainId, filter)),
      );

      // Combine successful results
      const allTransactions: TokenTransfer[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allTransactions.push(...result.value.items);
        } else {
          console.warn(`Failed to fetch transactions from chain ${chains[index]}:`, result.reason);
        }
      });

      // Sort by timestamp (newest first)
      allTransactions.sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return timeB - timeA;
      });

      return {
        items: allTransactions,
        next_page_params: null, // No pagination for combined results
      };
    } catch (error) {
      throw this.handleError(error as AxiosError, 'Failed to fetch transactions from all chains');
    }
  }

  /**
   * Transform Etherscan transaction to TokenTransfer format
   */
  private transformTransaction(
    tx: EtherscanTransaction,
    userAddress: string,
    chainId: SupportedChainId,
  ): TokenTransfer {
    return {
      block_number: parseInt(tx.blockNumber, 10),
      timestamp: new Date(parseInt(tx.timeStamp, 10) * 1000).toISOString(),
      tx_hash: tx.hash,
      from: {
        hash: tx.from.toLowerCase(),
      },
      to: {
        hash: tx.to.toLowerCase(),
      },
      token: {
        address: tx.contractAddress || '0x0000000000000000000000000000000000000000',
        name: tx.tokenName || CHAIN_NAMES[chainId],
        symbol: tx.tokenSymbol || CHAIN_NAMES[chainId].toUpperCase(),
        decimals: tx.tokenDecimal || '18',
      },
      total: {
        value: tx.value,
        decimals: tx.tokenDecimal || '18',
      },
    };
  }

  /**
   * Apply client-side filtering based on transaction direction
   */
  private applyFilter(
    transactions: EtherscanTransaction[],
    filter: TransactionFilter,
    userAddress: string,
  ): EtherscanTransaction[] {
    const normalizedAddress = userAddress.toLowerCase();

    if (filter === 'from') {
      return transactions.filter((tx) => tx.from.toLowerCase() === normalizedAddress);
    }

    if (filter === 'to') {
      return transactions.filter((tx) => tx.to.toLowerCase() === normalizedAddress);
    }

    // 'both' - return all transactions
    return transactions;
  }

  /**
   * Calculate next page parameters for pagination
   */
  private calculateNextPageParams(
    currentPage: number,
    currentOffset: number,
    resultCount: number,
  ): NextPageParams | null {
    // If we received fewer results than the offset, we're on the last page
    if (resultCount < currentOffset) {
      return null;
    }

    // Otherwise, there might be more pages
    return {
      page: currentPage + 1,
      offset: currentOffset,
    };
  }

  /**
   * Handle API errors and convert to ApiError
   */
  private handleError(error: AxiosError, defaultMessage: string): ApiError {
    if (error.response) {
      const statusCode = error.response.status;
      const data = error.response.data as EtherscanApiResponse;

      // Etherscan returns status "0" for errors
      if (data?.status === '0') {
        const message = data.message || defaultMessage;

        if (message.toLowerCase().includes('rate limit')) {
          return new ApiError(
            ErrorType.RATE_LIMIT_ERROR,
            'Rate limit exceeded',
            statusCode,
            error,
            true,
          );
        }

        if (message.toLowerCase().includes('invalid api key')) {
          return new ApiError(
            ErrorType.VALIDATION_ERROR,
            'Invalid API key',
            statusCode,
            error,
            false,
          );
        }

        return new ApiError(ErrorType.API_ERROR, message, statusCode, error, false);
      }

      // Standard HTTP error handling
      if (statusCode === 429) {
        return new ApiError(
          ErrorType.RATE_LIMIT_ERROR,
          'Rate limit exceeded',
          statusCode,
          error,
          true,
        );
      }

      if (statusCode >= 500) {
        return new ApiError(ErrorType.API_ERROR, 'Server error', statusCode, error, true);
      }

      return new ApiError(ErrorType.API_ERROR, defaultMessage, statusCode, error);
    }

    if (error.code === 'ECONNABORTED') {
      return new ApiError(ErrorType.TIMEOUT_ERROR, 'Request timeout', undefined, error, true);
    }

    if (error.request) {
      return new ApiError(ErrorType.NETWORK_ERROR, 'Network error', undefined, error, true);
    }

    return new ApiError(ErrorType.UNKNOWN_ERROR, defaultMessage, undefined, error);
  }
}

// Export singleton instance
export const etherscanService = new EtherscanService();
export default etherscanService;
