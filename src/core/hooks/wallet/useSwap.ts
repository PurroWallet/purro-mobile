/**
 * useSwap Hook
 * Custom hook for managing token swap operations with LiquidSwap integration
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ApiError } from '@/core/apis/errors';
import { liquidswapService } from '@/core/apis/liquidswap/liquidswapService';
import {
  DEFAULT_SLIPPAGE,
  type SwapRoute,
  type SwapRouteRequest,
  type Token,
} from '@/core/apis/liquidswap/types';
import { transactionService } from '@/core/services/TransactionService';

/**
 * Swap route parameters for finding routes
 */
export interface SwapRouteParams {
  tokenIn: string;
  tokenOut: string;
  amountIn?: string;
  amountOut?: string;
  multiHop?: boolean;
  unwrapWHYPE?: boolean;
  excludeDexes?: string;
  feeBps?: number;
  feeRecipient?: string;
}

/**
 * Token selection state
 */
export interface TokenSelection {
  tokenIn: Token | null;
  tokenOut: Token | null;
}

/**
 * useSwap hook return type
 */
export interface UseSwapReturn {
  // Route state
  route: SwapRoute | null;
  isLoadingRoute: boolean;
  routeError: Error | null;

  // Token selection
  tokenSelection: TokenSelection;
  setTokenIn: (token: Token | null) => void;
  setTokenOut: (token: Token | null) => void;
  swapTokens: () => void;

  // Slippage
  slippage: number;
  setSlippage: (slippage: number) => void;

  // Route finding
  findRoute: (params: SwapRouteParams) => void;
  clearRoute: () => void;

  // Swap execution
  executeSwap: (fromAddress: string) => void;
  isExecuting: boolean;
  executionError: Error | null;
  executionSuccess: boolean;
  clearExecutionState: () => void;
}

/**
 * Debounce delay for route finding (500ms)
 */
const ROUTE_DEBOUNCE_DELAY = 500;

const SWAP_ROUTE_QUERY_KEY = 'swap_route';

/**
 * Custom hook for swap operations
 */
export const useSwap = (): UseSwapReturn => {
  const queryClient = useQueryClient();

  // Token selection state
  const [tokenSelection, setTokenSelection] = useState<TokenSelection>({
    tokenIn: null,
    tokenOut: null,
  });

  // Slippage state
  const [slippage, setSlippage] = useState<number>(DEFAULT_SLIPPAGE);
  const [routeParams, setRouteParams] = useState<SwapRouteParams | null>(null);

  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // React Query for route finding
  const routeQuery = useQuery({
    queryKey: [SWAP_ROUTE_QUERY_KEY, routeParams, slippage],
    queryFn: async () => {
      if (!routeParams) return null;

      const request: SwapRouteRequest = {
        ...routeParams,
        slippage,
      };

      const response = await liquidswapService.findSwapRoute(request);

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error(response.error || 'Failed to find swap route');
    },
    enabled: !!routeParams,
    staleTime: 10000, // 10 seconds - routes change frequently
    gcTime: 30000, // 30 seconds
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  // React Query mutation for swap execution
  const swapMutation = useMutation({
    mutationFn: async ({ fromAddress, route }: { fromAddress: string; route: SwapRoute }) => {
      const txResult = await transactionService.sendTransaction({
        from: fromAddress,
        to: route.transaction.to,
        amount: '0',
        data: route.transaction.data,
      });

      console.log('✅ Swap transaction sent:', txResult.hash);
      return txResult;
    },
    onSuccess: () => {
      console.log('✅ Swap executed successfully');
    },
    onError: (error) => {
      console.error('❌ Swap execution failed:', error);
    },
  });

  /**
   * Set token in
   */
  const setTokenIn = useCallback((token: Token | null) => {
    setTokenSelection((prev) => ({ ...prev, tokenIn: token }));
  }, []);

  /**
   * Set token out
   */
  const setTokenOut = useCallback((token: Token | null) => {
    setTokenSelection((prev) => ({ ...prev, tokenOut: token }));
  }, []);

  /**
   * Swap token positions
   */
  const swapTokens = useCallback(() => {
    setTokenSelection((prev) => ({
      tokenIn: prev.tokenOut,
      tokenOut: prev.tokenIn,
    }));
    // Clear route when swapping tokens
    setRouteParams(null);
    queryClient.removeQueries({ queryKey: [SWAP_ROUTE_QUERY_KEY] });
  }, [queryClient]);

  /**
   * Find swap route with debouncing
   */
  const findRoute = useCallback((params: SwapRouteParams): void => {
    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Validate required parameters
    if (!params.tokenIn || !params.tokenOut) {
      console.error('Both tokenIn and tokenOut are required');
      return;
    }

    if (!params.amountIn && !params.amountOut) {
      console.error('Either amountIn or amountOut must be provided');
      return;
    }

    // Debounce the route params update
    debounceTimerRef.current = setTimeout(() => {
      setRouteParams(params);
    }, ROUTE_DEBOUNCE_DELAY);
  }, []);

  /**
   * Clear route state
   */
  const clearRoute = useCallback(() => {
    setRouteParams(null);
    queryClient.removeQueries({ queryKey: [SWAP_ROUTE_QUERY_KEY] });

    // Clear debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, [queryClient]);

  /**
   * Execute swap transaction
   */
  const executeSwap = useCallback(
    (fromAddress: string): void => {
      const route = routeQuery.data;

      if (!route) {
        console.error('No route available for swap');
        return;
      }

      if (!fromAddress) {
        console.error('Wallet address is required');
        return;
      }

      swapMutation.mutate({ fromAddress, route });
    },
    [routeQuery.data, swapMutation],
  );

  /**
   * Clear execution state
   */
  const clearExecutionState = useCallback(() => {
    swapMutation.reset();
  }, [swapMutation]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Clear debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    // Route state
    route: routeQuery.data ?? null,
    isLoadingRoute: routeQuery.isLoading,
    routeError: routeQuery.error instanceof Error ? routeQuery.error : null,

    // Token selection
    tokenSelection,
    setTokenIn,
    setTokenOut,
    swapTokens,

    // Slippage
    slippage,
    setSlippage,

    // Route finding
    findRoute,
    clearRoute,

    // Swap execution
    executeSwap,
    isExecuting: swapMutation.isPending,
    executionError: swapMutation.error instanceof Error ? swapMutation.error : null,
    executionSuccess: swapMutation.isSuccess,
    clearExecutionState,
  };
};
