/**
 * useTokenSelection Hook
 * Custom hook for managing token selection in swap operations
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { liquidswapService } from '@/core/apis/liquidswap/liquidswapService';
import type { Token, TokenBalance } from '@/core/apis/liquidswap/types';

/**
 * useTokenSelection hook return type
 */
export interface UseTokenSelectionReturn {
  // Token list state
  tokens: Token[];
  isLoadingTokens: boolean;
  tokensError: Error | null;

  // Token balances state
  balances: TokenBalance[];
  isLoadingBalances: boolean;
  balancesError: Error | null;

  // Search state
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Actions
  refetchTokens: () => void;
  refetchBalances: () => void;
}

/**
 * Hook parameters
 */
export interface UseTokenSelectionParams {
  wallet?: string;
  limit?: number;
  enableBalances?: boolean;
}

const TOKEN_SELECTION_QUERY_KEY = 'token_selection';
const TOKEN_BALANCES_QUERY_KEY = 'token_balances';

/**
 * Custom hook for token selection
 */
export const useTokenSelection = (
  params: UseTokenSelectionParams = {},
): UseTokenSelectionReturn => {
  const { wallet, limit = 100, enableBalances = false } = params;
  const queryClient = useQueryClient();

  // Search state with debouncing
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
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  // React Query for tokens list
  const tokensQuery = useQuery({
    queryKey: [TOKEN_SELECTION_QUERY_KEY, debouncedSearch, limit],
    queryFn: async () => {
      console.log('Fetching tokens - search:', debouncedSearch, 'limit:', limit);

      const response = await liquidswapService.fetchTokens({
        search: debouncedSearch || undefined,
        limit,
      });

      console.log('Fetched tokens:', response.tokens.length);
      return response.tokens;
    },
    staleTime: 60000, // 1 minute - token list is relatively stable
    gcTime: 300000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  // React Query for token balances
  const balancesQuery = useQuery({
    queryKey: [TOKEN_BALANCES_QUERY_KEY, wallet, limit],
    queryFn: async () => {
      if (!wallet || wallet.trim() === '') {
        throw new Error('Wallet address is required');
      }

      console.log('Fetching balances for wallet:', wallet);

      const response = await liquidswapService.fetchBalances(wallet, limit);

      console.log('Fetched balances:', response.balances.length);
      return response.balances;
    },
    enabled: enableBalances && !!wallet && wallet.trim() !== '',
    staleTime: 30000, // 30 seconds - balances change more frequently
    gcTime: 120000, // 2 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  /**
   * Refetch tokens
   */
  const refetchTokens = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [TOKEN_SELECTION_QUERY_KEY] });
  }, [queryClient]);

  /**
   * Refetch balances
   */
  const refetchBalances = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [TOKEN_BALANCES_QUERY_KEY] });
  }, [queryClient]);

  return {
    // Token list state
    tokens: tokensQuery.data ?? [],
    isLoadingTokens: tokensQuery.isLoading,
    tokensError: tokensQuery.error instanceof Error ? tokensQuery.error : null,

    // Token balances state
    balances: balancesQuery.data ?? [],
    isLoadingBalances: balancesQuery.isLoading,
    balancesError: balancesQuery.error instanceof Error ? balancesQuery.error : null,

    // Search state
    searchQuery,
    setSearchQuery,

    // Actions
    refetchTokens,
    refetchBalances,
  };
};
