/**
 * useTokenSelection Hook
 * Custom hook for managing token selection in swap operations
 */

import { useCallback, useEffect, useState } from 'react';
import type { ApiError } from '@/core/apis/errors';
import { liquidswapService } from '@/core/apis/liquidswap/liquidswapService';
import type { Token, TokenBalance } from '@/core/apis/liquidswap/types';

/**
 * useTokenSelection hook return type
 */
export interface UseTokenSelectionReturn {
  // Token list state
  tokens: Token[];
  isLoadingTokens: boolean;
  tokensError: ApiError | null;

  // Token balances state
  balances: TokenBalance[];
  isLoadingBalances: boolean;
  balancesError: ApiError | null;

  // Search state
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Actions
  fetchTokens: (search?: string, limit?: number) => Promise<void>;
  fetchBalances: (wallet: string, limit?: number) => Promise<void>;
  refetchTokens: () => Promise<void>;
  refetchBalances: () => Promise<void>;
}

/**
 * Custom hook for token selection
 */
export const useTokenSelection = (): UseTokenSelectionReturn => {
  // Token list state
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [tokensError, setTokensError] = useState<ApiError | null>(null);

  // Token balances state
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [balancesError, setBalancesError] = useState<ApiError | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Last fetch params for refetch
  const [lastTokenFetchParams, setLastTokenFetchParams] = useState<{
    search?: string;
    limit?: number;
  }>({});
  const [lastBalanceFetchParams, setLastBalanceFetchParams] = useState<{
    wallet?: string;
    limit?: number;
  }>({});

  /**
   * Fetch available tokens for swapping
   */
  const fetchTokens = useCallback(async (search?: string, limit?: number): Promise<void> => {
    setIsLoadingTokens(true);
    setTokensError(null);

    // Store params for refetch
    setLastTokenFetchParams({ search, limit });

    try {
      const response = await liquidswapService.fetchTokens({
        search,
        limit,
      });

      setTokens(response.tokens);
      setTokensError(null);
    } catch (error) {
      console.error('Failed to fetch tokens:', error);
      setTokens([]);
      setTokensError(error as ApiError);
    } finally {
      setIsLoadingTokens(false);
    }
  }, []);

  /**
   * Fetch token balances for a wallet
   */
  const fetchBalances = useCallback(async (wallet: string, limit?: number): Promise<void> => {
    if (!wallet || wallet.trim() === '') {
      setBalancesError({
        type: 'VALIDATION_ERROR',
        message: 'Wallet address is required',
      } as ApiError);
      return;
    }

    setIsLoadingBalances(true);
    setBalancesError(null);

    // Store params for refetch
    setLastBalanceFetchParams({ wallet, limit });

    try {
      const response = await liquidswapService.fetchBalances(wallet, limit);

      setBalances(response.balances);
      setBalancesError(null);
    } catch (error) {
      console.error('Failed to fetch balances:', error);
      setBalances([]);
      setBalancesError(error as ApiError);
    } finally {
      setIsLoadingBalances(false);
    }
  }, []);

  /**
   * Refetch tokens with last used parameters
   */
  const refetchTokens = useCallback(async (): Promise<void> => {
    await fetchTokens(lastTokenFetchParams.search, lastTokenFetchParams.limit);
  }, [fetchTokens, lastTokenFetchParams]);

  /**
   * Refetch balances with last used parameters
   */
  const refetchBalances = useCallback(async (): Promise<void> => {
    if (lastBalanceFetchParams.wallet) {
      await fetchBalances(lastBalanceFetchParams.wallet, lastBalanceFetchParams.limit);
    }
  }, [fetchBalances, lastBalanceFetchParams]);

  /**
   * Fetch tokens when search query changes (with debouncing handled by caller)
   */
  useEffect(() => {
    if (searchQuery) {
      fetchTokens(searchQuery);
    }
  }, [searchQuery, fetchTokens]);

  return {
    // Token list state
    tokens,
    isLoadingTokens,
    tokensError,

    // Token balances state
    balances,
    isLoadingBalances,
    balancesError,

    // Search state
    searchQuery,
    setSearchQuery,

    // Actions
    fetchTokens,
    fetchBalances,
    refetchTokens,
    refetchBalances,
  };
};
