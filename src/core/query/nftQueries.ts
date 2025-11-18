/**
 * NFT Query Functions and Hooks
 * React Query integration for NFT data fetching
 */

import { type UseInfiniteQueryResult, useInfiniteQuery } from '@tanstack/react-query';
import { hyperscanService } from '@/core/apis/hyperscan/hyperscanService';
import type { NextPageParams, NFTCollectionsResponse } from '@/core/apis/hyperscan/types';

/**
 * Query key factory for NFT queries
 * Ensures consistent cache key generation and proper cache separation
 */
export const nftQueryKeys = {
  all: ['nfts'] as const,
  collections: (address: string, isTestnet: boolean) =>
    [...nftQueryKeys.all, 'collections', address, isTestnet] as const,
};

/**
 * Fetch NFT collections with pagination
 * @param address - Wallet address to fetch NFTs for
 * @param isTestnet - Whether to use testnet endpoints
 * @param pageParam - Pagination parameters from previous page
 * @returns NFT collections response with pagination info
 */
export async function fetchNFTCollections(
  address: string,
  isTestnet: boolean,
  pageParam?: NextPageParams,
): Promise<NFTCollectionsResponse> {
  // Configure service for correct network
  hyperscanService.setTestnetMode(isTestnet);

  // Fetch collections
  return hyperscanService.fetchNFTCollections(address, pageParam);
}

/**
 * useInfiniteQuery hook for NFT collections
 * Provides automatic pagination, caching, and background refetching
 *
 * @param address - Wallet address to fetch NFTs for
 * @param isTestnet - Whether to use testnet endpoints
 * @returns React Query infinite query result
 *
 * @example
 * ```tsx
 * const query = useNFTCollectionsQuery(address, isTestnet);
 *
 * // Access paginated data
 * const allCollections = query.data?.pages.flatMap(page => page.items) ?? [];
 *
 * // Load more
 * if (query.hasNextPage) {
 *   query.fetchNextPage();
 * }
 * ```
 */
export function useNFTCollectionsQuery(
  address: string,
  isTestnet: boolean,
): UseInfiniteQueryResult<NFTCollectionsResponse, Error> {
  return useInfiniteQuery({
    queryKey: nftQueryKeys.collections(address, isTestnet),

    queryFn: ({ pageParam }) => fetchNFTCollections(address, isTestnet, pageParam),

    initialPageParam: undefined as NextPageParams | undefined,

    getNextPageParam: (lastPage) => lastPage.next_page_params ?? undefined,

    enabled: !!address && address.length > 0,

    // Stale-while-revalidate: serve cached data immediately
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}
