/**
 * useNFTs Hook
 * Manages NFT collection fetching with cache-first strategy and pagination
 */

import { useCallback, useEffect, useState } from 'react';
import { hyperscanService } from '@/core/apis/hyperscan/hyperscanService';
import type {
  NextPageParams,
  NFTCollection,
  NFTCollectionsResponse,
} from '@/core/apis/hyperscan/types';
import { nftCollectionCache } from '@/core/storage/nftCollectionCache';

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
 * Fetches and manages NFT collections with cache-first strategy and pagination
 *
 * @param address - Wallet address to fetch NFTs for
 * @param isTestnet - Whether to use testnet endpoints (default: false)
 * @returns NFT collections, loading state, error state, and utility functions
 *
 * @example
 * ```tsx
 * const { collections, isLoading, error, hasNextPage, fetchNextPage, refetch } = useNFTs(address);
 *
 * if (isLoading && collections.length === 0) return <LoadingSpinner />;
 * if (error) return <ErrorMessage error={error} onRetry={refetch} />;
 *
 * return (
 *   <NFTList
 *     collections={collections}
 *     onLoadMore={hasNextPage ? fetchNextPage : undefined}
 *     onRefresh={refetch}
 *   />
 * );
 * ```
 */
export function useNFTs(address: string, isTestnet: boolean = false): UseNFTsReturn {
  const [collections, setCollections] = useState<NFTCollection[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [nextPageParams, setNextPageParams] = useState<NextPageParams | null>(null);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);

  /**
   * Fetch NFT collections with cache-first strategy
   * 1. Check cache for data
   * 2. If cached and fresh, use cached data
   * 3. If not cached or stale, fetch from API
   * 4. Cache newly fetched data
   */
  const fetchCollections = useCallback(
    async (page: number, pageParams?: NextPageParams, append: boolean = false) => {
      if (!address || address.length === 0) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log(`🔍 useNFTs - Fetching NFTs for address: ${address}, page: ${page}`);

        // Step 1: Check cache first
        const cachedData = nftCollectionCache.getCachedNFTs(address, page, pageParams);

        if (cachedData) {
          console.log(`💾 useNFTs - Using cached data for page ${page}`);

          // Use cached data
          if (append) {
            setCollections((prev) => [...prev, ...cachedData.data.items]);
          } else {
            setCollections(cachedData.data.items);
          }
          setNextPageParams(cachedData.data.next_page_params);
          setHasNextPage(cachedData.data.next_page_params !== null);
          setIsLoading(false);

          // Check if data is stale and fetch in background
          const isFresh = nftCollectionCache.isDataFresh(cachedData.timestamp);
          if (!isFresh) {
            console.log(`🔄 useNFTs - Cached data is stale, fetching fresh data in background`);
            // Fetch fresh data in background without blocking UI
            fetchFromAPI(page, pageParams, append).catch((err) => {
              console.error('❌ useNFTs - Background refresh failed:', err);
            });
          }
          return;
        }

        // Step 2: Fetch from API if not cached
        await fetchFromAPI(page, pageParams, append);
      } catch (err) {
        console.error('❌ useNFTs - Failed to fetch NFTs:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch NFTs'));
        setIsLoading(false);
      }
    },
    [address, isTestnet],
  );

  /**
   * Fetch NFT collections from API
   */
  const fetchFromAPI = async (
    page: number,
    pageParams?: NextPageParams,
    append: boolean = false,
  ) => {
    console.log(`📡 useNFTs - Fetching from API for page ${page}`);

    // Set testnet mode
    hyperscanService.setTestnetMode(isTestnet);

    // Fetch from API
    const response: NFTCollectionsResponse = await hyperscanService.fetchNFTCollections(
      address,
      pageParams,
    );

    // Step 3: Cache the response
    nftCollectionCache.setCachedNFTs(address, page, pageParams, response);
    console.log(`💾 useNFTs - Cached NFT data for page ${page}`);

    // Step 4: Update state
    if (append) {
      setCollections((prev) => [...prev, ...response.items]);
    } else {
      setCollections(response.items);
    }
    setNextPageParams(response.next_page_params);
    setHasNextPage(response.next_page_params !== null);
    setIsLoading(false);

    console.log(`✅ useNFTs - Successfully fetched ${response.items.length} collections`);
  };

  /**
   * Fetch next page of collections
   */
  const fetchNextPage = useCallback(async () => {
    if (!hasNextPage || isLoading) {
      return;
    }

    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await fetchCollections(nextPage, nextPageParams || undefined, true);
  }, [hasNextPage, isLoading, currentPage, nextPageParams, fetchCollections]);

  /**
   * Refetch collections from API
   * Clears current data and fetches from beginning
   */
  const refetch = useCallback(async () => {
    console.log('🔄 useNFTs - Refetching NFTs');
    setCollections([]);
    setCurrentPage(0);
    setNextPageParams(null);
    await fetchCollections(0, undefined, false);
  }, [fetchCollections]);

  /**
   * Initial fetch on mount or when address changes
   */
  useEffect(() => {
    if (address && address.length > 0) {
      setCollections([]);
      setCurrentPage(0);
      setNextPageParams(null);
      fetchCollections(0, undefined, false);
    }
  }, [address, isTestnet]);

  return {
    collections,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    refetch,
  };
}
