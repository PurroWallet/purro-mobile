/**
 * useSearchScreen Hook
 * Manages token search with infinite scroll and debouncing
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { tokenService } from '@/core/services/TokenService';

export interface UseSearchScreenReturn {
  // Search state
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Token data
  tokens: any[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;

  // Actions
  handleRefresh: () => void;
  handleLoadMore: () => void;
  formatNumber: (num: number) => string;
}

export const useSearchScreen = (): UseSearchScreenReturn => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search query
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  // React Query for infinite token list
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } =
    useInfiniteQuery({
      queryKey: ['tokens', 'hyperliquid', debouncedSearch],
      queryFn: async ({ pageParam = 1 }) => {
        console.log('Fetching tokens - page:', pageParam, 'search:', debouncedSearch);

        const response = await tokenService.fetchTokens({
          network: 'hyperliquid',
          search: debouncedSearch,
          page: pageParam,
          limit: 20,
        });

        console.log('Response:', response);
        return response;
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        return lastPage?.hasMore ? allPages.length + 1 : undefined;
      },
      staleTime: 30000, // 30 seconds
      gcTime: 300000, // 5 minutes
    });

  // Flatten all pages into single token array
  const tokens = data?.pages.flatMap((page) => page?.tokens ?? []) ?? [];

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const formatNumber = useCallback((num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  return {
    searchQuery,
    setSearchQuery,
    tokens,
    isLoading,
    isFetchingNextPage,
    hasNextPage: hasNextPage ?? false,
    handleRefresh,
    handleLoadMore,
    formatNumber,
  };
};
