/**
 * useTokens Hook
 * Manages token fetching and state for all chains (HyperLiquid + EVM) with cache-first strategy
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { fetchAllEvmTokens, fetchBatchTokenMetadata } from '@/core/apis/alchemy/alchemyService';
import type { ChainTokenData, TokenWithMetadata } from '@/core/apis/alchemy/types';
import { getEndpoints } from '@/core/apis/endpoints';
import { tokenMetadataCache } from '@/core/storage/tokenMetadataCache';

interface HyperLiquidToken {
  token: string;
  name: string;
  symbol: string;
  balance: string;
  decimals: number;
}

interface HyperLiquidResponse {
  wallet: string;
  tokens: HyperLiquidToken[];
  count: number;
  limitedCount: number;
  limitApplied: boolean;
  serviceStatus: string;
}

const TOKENS_QUERY_KEY_PREFIX = 'wallet_tokens';

/**
 * Generate query key for tokens
 */
function getTokensQueryKey(address: string, isTestnet: boolean = false): string[] {
  return [TOKENS_QUERY_KEY_PREFIX, address, isTestnet ? 'testnet' : 'mainnet'];
}

/**
 * Chain ID mapping for cache
 */
const CHAIN_ID_MAP = {
  ethereum: 'ethereum',
  base: 'base',
  arbitrum: 'arbitrum',
} as const;

/**
 * Fetch HyperLiquid tokens
 */
async function fetchHyperLiquidTokens(address: string): Promise<ChainTokenData> {
  try {
    console.log('🔍 useTokens - Fetching HyperLiquid tokens for:', address);
    const response = await fetch(
      `https://api.liqd.ag/tokens/balances?wallet=${address}&limit=200`,
      {
        headers: {
          accept: '*/*',
          'content-type': 'application/json',
        },
      },
    );

    console.log('📡 useTokens - HyperLiquid response status:', response.status);

    if (!response.ok) {
      throw new Error(`Failed to fetch HyperLiquid tokens: ${response.status}`);
    }

    const text = await response.text();
    console.log('📦 useTokens - HyperLiquid raw response:', text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('❌ useTokens - Failed to parse HyperLiquid response:', parseError);
      return {
        chain: 'hyperliquid' as any,
        tokens: [],
      };
    }

    console.log('📦 useTokens - HyperLiquid parsed data:', data);

    // Check if response has success and data
    const apiResponse = data as { success: boolean; data: HyperLiquidResponse };
    if (!apiResponse.success || !apiResponse.data) {
      console.warn('⚠️ useTokens - HyperLiquid response unsuccessful:', data);
      return {
        chain: 'hyperliquid' as any,
        tokens: [],
      };
    }

    const responseData = apiResponse.data;
    if (!responseData.tokens || !Array.isArray(responseData.tokens)) {
      console.warn('⚠️ useTokens - HyperLiquid response has no tokens array:', data);
      return {
        chain: 'hyperliquid' as any,
        tokens: [],
      };
    }

    const tokens: TokenWithMetadata[] = responseData.tokens.map((token: HyperLiquidToken) => ({
      contractAddress: token.token,
      balance: token.balance,
      metadata: {
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        logo: undefined,
      },
      balanceUsd: 0,
    }));

    console.log('✅ useTokens - HyperLiquid tokens processed:', tokens.length);

    return {
      chain: 'hyperliquid' as any,
      tokens,
    };
  } catch (error) {
    console.error('❌ useTokens - Failed to fetch HyperLiquid tokens:', error);
    return {
      chain: 'hyperliquid' as any,
      tokens: [],
      error: error instanceof Error ? error.message : 'Failed to fetch HyperLiquid tokens',
    };
  }
}

/**
 * Fetch tokens with cache-first strategy and graceful degradation
 * 1. Check cache for metadata
 * 2. Fetch balances from API (HyperLiquid + EVM chains)
 * 3. Use cached metadata where available
 * 4. Fetch missing metadata from API
 * 5. Cache newly fetched metadata
 * 6. Handle partial failures gracefully - show data from successful chains
 */
async function fetchTokens(address: string, isTestnet: boolean = false): Promise<ChainTokenData[]> {
  try {
    console.log('🔍 useTokens - Fetching tokens for address:', address);

    // Fetch all token balances in parallel (HyperLiquid + EVM chains)
    const [hyperLiquidData, ...evmChainDataArray] = await Promise.all([
      fetchHyperLiquidTokens(address),
      fetchAllEvmTokens(address, isTestnet),
    ]);

    const chainDataArray = evmChainDataArray.flat();
    const endpoints = getEndpoints(isTestnet);

    const processedResults = await Promise.allSettled(
      chainDataArray.map(async (chainData) => {
        // If there was an error or no tokens, return as-is
        if (chainData.error || chainData.tokens.length === 0) {
          return chainData;
        }

        const chainId = CHAIN_ID_MAP[chainData.chain];
        const contractAddresses = chainData.tokens.map((t) => t.contractAddress);

        // Step 1: Get cached metadata for all tokens
        const cachedMetadata = tokenMetadataCache.getMultipleCachedMetadata(
          chainId,
          contractAddresses,
        );

        // Step 2: Identify tokens that need metadata fetching
        const tokensNeedingMetadata = chainData.tokens.filter(
          (token) => !cachedMetadata[token.contractAddress.toLowerCase()],
        );

        // Step 3: Fetch missing metadata if needed
        let newMetadata: Record<string, import('@/core/apis/alchemy/types').TokenMetadata> = {};
        if (tokensNeedingMetadata.length > 0) {
          console.log(
            `📡 useTokens - Fetching metadata for ${tokensNeedingMetadata.length} tokens on ${chainData.chain}`,
          );

          const endpoint =
            chainData.chain === 'ethereum'
              ? endpoints.alchemy.ethereum
              : chainData.chain === 'base'
                ? endpoints.alchemy.base
                : endpoints.alchemy.arbitrum;

          const addressesToFetch = tokensNeedingMetadata.map((t) => t.contractAddress);

          try {
            newMetadata = await fetchBatchTokenMetadata(endpoint, addressesToFetch);

            // Step 4: Cache newly fetched metadata
            tokenMetadataCache.cacheMultipleMetadata(chainId, newMetadata);
            console.log(
              `💾 useTokens - Cached metadata for ${Object.keys(newMetadata).length} tokens on ${chainData.chain}`,
            );
          } catch (metadataError) {
            // Graceful degradation: If metadata fetch fails, use fallback metadata
            console.warn(
              `⚠️ useTokens - Failed to fetch metadata for ${chainData.chain}, using fallback`,
              metadataError,
            );
          }
        }

        // Step 5: Combine cached and newly fetched metadata
        const allMetadata = { ...cachedMetadata, ...newMetadata };

        // Step 6: Update tokens with metadata from cache or API
        const tokensWithMetadata: TokenWithMetadata[] = chainData.tokens.map((token) => {
          const metadata = allMetadata[token.contractAddress.toLowerCase()];
          return {
            ...token,
            metadata: metadata || token.metadata,
          };
        });

        return {
          ...chainData,
          tokens: tokensWithMetadata,
        };
      }),
    );

    // Extract successful results and log failures
    const processedChainData: ChainTokenData[] = [];
    processedResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        processedChainData.push(result.value);
      } else {
        // Log the failure but continue with other chains
        const chainName = chainDataArray[index]?.chain || 'unknown';
        console.error(`❌ useTokens - Failed to process ${chainName} chain:`, result.reason);
        // Add empty chain data with error message
        processedChainData.push({
          chain: chainDataArray[index]?.chain || 'ethereum',
          tokens: [],
          error: result.reason?.message || 'Failed to process chain data',
        });
      }
    });

    console.log('✅ useTokens - Successfully fetched tokens for all chains');
    // Add HyperLiquid data at the beginning
    return [hyperLiquidData, ...processedChainData];
  } catch (error) {
    console.error('❌ useTokens - Failed to fetch tokens:', error);
    throw error instanceof Error ? error : new Error('Failed to fetch tokens');
  }
}

/**
 * Hook return type
 */
export interface UseTokensReturn {
  /** Token data for all chains */
  tokens: ChainTokenData[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Refetch tokens from API */
  refetch: () => Promise<void>;
  /** Clear token metadata cache */
  clearCache: () => Promise<void>;
}

/**
 * useTokens Hook
 * Fetches and manages EVM tokens across Ethereum, Base, and Arbitrum chains
 * with cache-first strategy for token metadata
 *
 * @param address - Wallet address to fetch tokens for
 * @param isTestnet - Whether to use testnet endpoints (default: false)
 * @returns Token data, loading state, error state, and utility functions
 *
 * @example
 * ```tsx
 * const { tokens, isLoading, error, refetch, clearCache } = useTokens(address);
 *
 * if (isLoading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage error={error} onRetry={refetch} />;
 *
 * return (
 *   <TokenList
 *     tokens={tokens}
 *     onRefresh={refetch}
 *     onClearCache={clearCache}
 *   />
 * );
 * ```
 */
export function useTokens(address: string, isTestnet: boolean = false): UseTokensReturn {
  const queryClient = useQueryClient();
  const queryKey = getTokensQueryKey(address, isTestnet);

  const query = useQuery({
    queryKey,
    queryFn: () => fetchTokens(address, isTestnet),
    enabled: !!address && address.length > 0,
    staleTime: 30000, // 30 seconds - tokens are relatively stable
    gcTime: 300000, // 5 minutes - keep in cache for quick access
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });

  /**
   * Refetch tokens from API
   * Invalidates cache and fetches fresh data
   */
  const refetch = useCallback(async () => {
    console.log('🔄 useTokens - Refetching tokens');
    await queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  /**
   * Clear token metadata cache
   * Clears all cached metadata and refetches tokens
   */
  const clearCache = useCallback(async () => {
    console.log('🗑️ useTokens - Clearing token metadata cache');
    try {
      tokenMetadataCache.clearAllCache();
      await queryClient.invalidateQueries({ queryKey });
      console.log('✅ useTokens - Cache cleared successfully');
    } catch (error) {
      console.error('❌ useTokens - Failed to clear cache:', error);
      throw error;
    }
  }, [queryClient, queryKey]);

  return {
    tokens: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error : null,
    refetch,
    clearCache,
  };
}
