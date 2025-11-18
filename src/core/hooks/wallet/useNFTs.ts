/**
 * useNFTs Hook
 * Manages NFT collection fetching using React Query for caching and pagination
 */

import type { InfiniteData } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { NFTCollection, NFTCollectionsResponse } from '@/core/apis/hyperscan/types';
import { useNFTCollectionsQuery } from '@/core/query/nftQueries';

/**
 * Hook return type
 */
export interface UseNFTsReturn {
  /** NFT collections */
  collections: NFTCollection[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Whether there are more pages to fetch */
  hasNextPage: boolean;
  /** Fetch next page of collections */
  fetchNextPage: () => Promise<void>;
  /** Refetch collections from API */
  refetch: () => Promise<void>;
}

/**
 * useNFTs Hook
 * Fetches and manages NFT collections using React Query for automatic caching and pagination
 *
 * @param address - Wallet address to fetch NFTs for
 * @param isTestnet - Whether to use testnet endpoints (default: false)
 * @returns NFT collections, loading state, error state, and utility functions
 */
export function useNFTs(address: string, isTestnet: boolean = false): UseNFTsReturn {
  // Use React Query for data fetching and caching
  const query = useNFTCollectionsQuery(address, isTestnet);

  // Flatten paginated data into single collections array
  const collections = useMemo(() => {
    const data = query.data as InfiniteData<NFTCollectionsResponse> | undefined;
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.items ?? []);
  }, [query.data]);

  // Map React Query state to legacy interface
  return {
    collections,
    isLoading: query.isLoading,
    error: query.error,
    hasNextPage: query.hasNextPage ?? false,
    fetchNextPage: async () => {
      await query.fetchNextPage();
    },
    refetch: async () => {
      await query.refetch();
    },
  };
}
