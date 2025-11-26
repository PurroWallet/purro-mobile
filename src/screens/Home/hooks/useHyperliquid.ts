/**
 * useHyperliquid Hook
 * Custom hook for managing Hyperliquid account data
 */

import { useCallback, useEffect, useState } from 'react';
import {
  type AccountMetrics,
  type ClearinghouseState,
  type FormattedPosition,
  hyperliquidService,
} from '@/core/apis/hyperliquid';

interface UseHyperliquidResult {
  accountMetrics: AccountMetrics | null;
  positions: FormattedPosition[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching and managing Hyperliquid account data
 * @param address - Wallet address
 * @param enabled - Whether to fetch data
 * @returns Hyperliquid account data and control functions
 */
export function useHyperliquid(
  address: string | undefined,
  enabled: boolean,
): UseHyperliquidResult {
  const [accountMetrics, setAccountMetrics] = useState<AccountMetrics | null>(null);
  const [positions, setPositions] = useState<FormattedPosition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!address || !enabled) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const state: ClearinghouseState = await hyperliquidService.fetchClearinghouseState(address);
      const metrics = hyperliquidService.getAccountMetrics(state);
      const formattedPositions = hyperliquidService.getFormattedPositions(state);

      setAccountMetrics(metrics);
      setPositions(formattedPositions);
    } catch (err) {
      console.error('Failed to fetch Hyperliquid data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch Hyperliquid data');

      // Set default values on error
      setAccountMetrics({
        accountValue: '$0.00',
        marginUsed: '$0.00',
        totalPosition: '$0.00',
        withdrawable: '$0.00',
      });
      setPositions([]);
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
    accountMetrics,
    positions,
    isLoading,
    error,
    refresh,
  };
}
