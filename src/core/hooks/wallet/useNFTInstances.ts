/**
 * useNFTInstances Hook
 * Manages NFT instance fetching for a specific collection with pagination
 */

import { useCallback, useEffect, useState } from 'react';
import { hyperscanService } from '@/core/apis/hyperscan/hyperscanService';
import type {
  NextPageParams,
  NFTInstance,
  NFTInstancesResponse,
} from '@/core/apis/hyperscan/types';

/**
 * Hook return type
 */
export interface UseNFTInstancesReturn {
  /** NFT instances */
  instances: NFTInstance[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Whether there are more pages to fetch */
  hasNextPage: boolean;
  /** Fetch next page of instances */
  fetchNextPage: () => Promise<void>;
  /** Refetch instances from API */
  refetch: () => Promise<void>;
}

/**
 * useNFTInstances Hook
 * Fetches and manages NFT instances for a specific collection with pagination
 *
 * @param tokenAddress - NFT contract address
 * @param holderAddress - Wallet address holding the NFTs
 * @param isTestnet - Whether to use testnet endpoints (default: false)
 * @returns NFT instances, loading state, error state, and utility functions
 *
 * @example
 * ```tsx
 * const { instances, isLoading, error, hasNextPage, fetchNextPage, refetch } = useNFTInstances(
 *   tokenAddress,
 *   holderAddress
 * );
 *
 * if (isLoading && instances.length === 0) return <LoadingSpinner />;
 * if (error) return <ErrorMessage error={error} onRetry={refetch} />;
 *
 * return (
 *   <NFTInstanceList
 *     instances={instances}
 *     onLoadMore={hasNextPage ? fetchNextPage : undefined}
 *     onRefresh={refetch}
 *   />
 * );
 * ```
 */
export function useNFTInstances(
  tokenAddress: string,
  holderAddress: string,
  isTestnet: boolean = false,
): UseNFTInstancesReturn {
  const [instances, setInstances] = useState<NFTInstance[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [nextPageParams, setNextPageParams] = useState<NextPageParams | null>(null);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);

  /**
   * Fetch NFT instances from API
   */
  const fetchInstances = useCallback(
    async (pageParams?: NextPageParams, append: boolean = false) => {
      if (
        !tokenAddress ||
        tokenAddress.length === 0 ||
        !holderAddress ||
        holderAddress.length === 0
      ) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log(
          `🔍 useNFTInstances - Fetching instances for token: ${tokenAddress}, holder: ${holderAddress}`,
        );

        // Set testnet mode
        hyperscanService.setTestnetMode(isTestnet);

        // Fetch from API
        const response: NFTInstancesResponse = await hyperscanService.fetchNFTInstances(
          tokenAddress,
          holderAddress,
          pageParams,
        );

        // Update state
        if (append) {
          setInstances((prev) => [...prev, ...response.items]);
        } else {
          setInstances(response.items);
        }
        setNextPageParams(response.next_page_params);
        setHasNextPage(response.next_page_params !== null);
        setIsLoading(false);

        console.log(`✅ useNFTInstances - Successfully fetched ${response.items.length} instances`);
      } catch (err) {
        console.error('❌ useNFTInstances - Failed to fetch instances:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch NFT instances'));
        setIsLoading(false);
      }
    },
    [tokenAddress, holderAddress, isTestnet],
  );

  /**
   * Fetch next page of instances
   */
  const fetchNextPage = useCallback(async () => {
    if (!hasNextPage || isLoading) {
      return;
    }

    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await fetchInstances(nextPageParams || undefined, true);
  }, [hasNextPage, isLoading, currentPage, nextPageParams, fetchInstances]);

  /**
   * Refetch instances from API
   * Clears current data and fetches from beginning
   */
  const refetch = useCallback(async () => {
    console.log('🔄 useNFTInstances - Refetching instances');
    setInstances([]);
    setCurrentPage(0);
    setNextPageParams(null);
    await fetchInstances(undefined, false);
  }, [fetchInstances]);

  /**
   * Initial fetch on mount or when addresses change
   */
  useEffect(() => {
    if (tokenAddress && tokenAddress.length > 0 && holderAddress && holderAddress.length > 0) {
      setInstances([]);
      setCurrentPage(0);
      setNextPageParams(null);
      fetchInstances(undefined, false);
    }
  }, [tokenAddress, holderAddress, isTestnet]);

  return {
    instances,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    refetch,
  };
}
