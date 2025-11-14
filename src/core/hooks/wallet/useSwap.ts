/**
 * useSwap Hook
 * Custom hook for managing token swap operations with LiquidSwap integration
 */

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
  routeError: ApiError | null;

  // Token selection
  tokenSelection: TokenSelection;
  setTokenIn: (token: Token | null) => void;
  setTokenOut: (token: Token | null) => void;
  swapTokens: () => void;

  // Slippage
  slippage: number;
  setSlippage: (slippage: number) => void;

  // Route finding
  findRoute: (params: SwapRouteParams) => Promise<void>;
  clearRoute: () => void;

  // Swap execution
  executeSwap: (fromAddress: string) => Promise<void>;
  isExecuting: boolean;
  executionError: ApiError | null;
  executionSuccess: boolean;
  clearExecutionState: () => void;
}

/**
 * Debounce delay for route finding (500ms)
 */
const ROUTE_DEBOUNCE_DELAY = 500;

/**
 * Custom hook for swap operations
 */
export const useSwap = (): UseSwapReturn => {
  // Route state
  const [route, setRoute] = useState<SwapRoute | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState<ApiError | null>(null);

  // Token selection state
  const [tokenSelection, setTokenSelection] = useState<TokenSelection>({
    tokenIn: null,
    tokenOut: null,
  });

  // Slippage state
  const [slippage, setSlippage] = useState<number>(DEFAULT_SLIPPAGE);

  // Execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionError, setExecutionError] = useState<ApiError | null>(null);
  const [executionSuccess, setExecutionSuccess] = useState(false);

  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Abort controller for cancelling requests
  const abortControllerRef = useRef<AbortController | null>(null);

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
    setRoute(null);
    setRouteError(null);
  }, []);

  /**
   * Find swap route with debouncing
   */
  const findRoute = useCallback(
    async (params: SwapRouteParams): Promise<void> => {
      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Validate required parameters
      if (!params.tokenIn || !params.tokenOut) {
        setRouteError({
          type: 'VALIDATION_ERROR',
          message: 'Both tokenIn and tokenOut are required',
        } as ApiError);
        return;
      }

      if (!params.amountIn && !params.amountOut) {
        setRouteError({
          type: 'VALIDATION_ERROR',
          message: 'Either amountIn or amountOut must be provided',
        } as ApiError);
        return;
      }

      // Set loading state immediately
      setIsLoadingRoute(true);
      setRouteError(null);

      // Debounce the actual API call
      debounceTimerRef.current = setTimeout(async () => {
        try {
          // Create new abort controller
          abortControllerRef.current = new AbortController();

          // Build request with slippage
          const request: SwapRouteRequest = {
            ...params,
            slippage,
          };

          // Call API
          const response = await liquidswapService.findSwapRoute(request);

          // Check if request was aborted
          if (abortControllerRef.current?.signal.aborted) {
            return;
          }

          if (response.success && response.data) {
            setRoute(response.data);
            setRouteError(null);
          } else {
            setRoute(null);
            setRouteError({
              type: 'API_ERROR',
              message: response.error || 'Failed to find swap route',
            } as ApiError);
          }
        } catch (error) {
          // Check if request was aborted
          if (abortControllerRef.current?.signal.aborted) {
            return;
          }

          setRoute(null);
          setRouteError(error as ApiError);
        } finally {
          setIsLoadingRoute(false);
        }
      }, ROUTE_DEBOUNCE_DELAY);
    },
    [slippage],
  );

  /**
   * Clear route state
   */
  const clearRoute = useCallback(() => {
    setRoute(null);
    setRouteError(null);
    setIsLoadingRoute(false);

    // Clear debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Cancel pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  /**
   * Execute swap transaction
   */
  const executeSwap = useCallback(
    async (fromAddress: string): Promise<void> => {
      if (!route) {
        setExecutionError({
          type: 'VALIDATION_ERROR',
          message: 'No route available for swap',
        } as ApiError);
        return;
      }

      if (!fromAddress) {
        setExecutionError({
          type: 'VALIDATION_ERROR',
          message: 'Wallet address is required',
        } as ApiError);
        return;
      }

      setIsExecuting(true);
      setExecutionError(null);
      setExecutionSuccess(false);

      try {
        // Execute the swap transaction using the route data
        const txResult = await transactionService.sendTransaction({
          from: fromAddress,
          to: route.transaction.to,
          amount: '0', // Amount is encoded in data
          data: route.transaction.data,
        });

        console.log('✅ Swap transaction sent:', txResult.hash);

        setExecutionSuccess(true);
        setExecutionError(null);
      } catch (error) {
        console.error('❌ Swap execution failed:', error);
        setExecutionSuccess(false);
        setExecutionError(error as ApiError);
      } finally {
        setIsExecuting(false);
      }
    },
    [route],
  );

  /**
   * Clear execution state
   */
  const clearExecutionState = useCallback(() => {
    setExecutionError(null);
    setExecutionSuccess(false);
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Clear debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Cancel pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    // Route state
    route,
    isLoadingRoute,
    routeError,

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
    isExecuting,
    executionError,
    executionSuccess,
    clearExecutionState,
  };
};
