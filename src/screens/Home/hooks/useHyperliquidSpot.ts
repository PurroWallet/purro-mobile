/**
 * useHyperliquidSpot Hook
 * Custom hook for managing Hyperliquid Spot token data
 */

import { useCallback, useEffect, useState } from 'react';
import {
  type FormattedSpotToken,
  hyperliquidService,
  type SpotClearinghouseState,
} from '@/core/apis/hyperliquid';

interface UseHyperliquidSpotResult {
  tokens: FormattedSpotToken[];
  totalBalance: string;
  totalTokensCount: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching and managing Hyperliquid Spot token data
 * @param address - Wallet address
 * @param enabled - Whether to fetch data
 * @returns Hyperliquid Spot token data and control functions
 */
export function useHyperliquidSpot(
  address: string | undefined,
  enabled: boolean,
): UseHyperliquidSpotResult {
  const [tokens, setTokens] = useState<FormattedSpotToken[]>([]);
  const [totalBalance, setTotalBalance] = useState<string>('$0.00');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!address || !enabled) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch both state and prices in parallel
      const [state, prices] = await Promise.all([
        hyperliquidService.fetchSpotClearinghouseState(address),
        hyperliquidService.fetchAllMids(),
      ]);

      console.log('Spot state:', state);
      console.log('Prices:', prices);

      const formattedTokens = hyperliquidService.getFormattedSpotTokens(state, prices);
      const total = hyperliquidService.calculateSpotTotalBalance(formattedTokens);

      console.log('Formatted tokens:', formattedTokens);
      console.log('Total balance:', total);

      setTokens(formattedTokens);
      setTotalBalance(total);
    } catch (err) {
      console.error('Failed to fetch Hyperliquid Spot data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch Hyperliquid Spot data');

      // Set default values on error
      setTokens([]);
      setTotalBalance('$0.00');
    } finally {
      setIsLoading(false);
    }
  }, [address, enabled]);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (enabled && address) {
      fetchData();
    }
  }, [enabled, address, fetchData]);

  return {
    tokens,
    totalBalance,
    totalTokensCount: tokens.length,
    isLoading,
    error,
    refresh,
  };
}
