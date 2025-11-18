/**
 * LiquidSwap API Service
 * Service for token swap route finding, token list fetching, and balance queries
 */

import { type AxiosError } from 'axios';
import { API_TIMEOUTS, getEndpoints } from '../endpoints';
import { ApiError, ErrorType } from '../errors';
import { httpClient } from '../httpClient';
import {
  type BalancesResponse,
  type FetchTokensRequest,
  type SwapRouteRequest,
  type SwapRouteResponse,
  type TokensResponse,
} from './types';

/**
 * LiquidSwap Service Class
 */
class LiquidSwapService {
  private isTestnet: boolean = false;

  /**
   * Set network mode (mainnet/testnet)
   */
  setTestnetMode(isTestnet: boolean): void {
    this.isTestnet = isTestnet;
  }

  /**
   * Get LiquidSwap API endpoint
   */
  private getEndpoint(): string {
    return getEndpoints(this.isTestnet).liquidswap;
  }

  /**
   * Find swap route for token exchange
   * @param request - Swap route request parameters
   * @returns Swap route response with transaction data
   */
  async findSwapRoute(request: SwapRouteRequest): Promise<SwapRouteResponse> {
    // Validate required parameters
    if (!request.tokenIn || !request.tokenOut) {
      throw new ApiError(ErrorType.VALIDATION_ERROR, 'tokenIn and tokenOut are required');
    }

    // Validate that either amountIn or amountOut is provided
    if (!request.amountIn && !request.amountOut) {
      throw new ApiError(
        ErrorType.VALIDATION_ERROR,
        'Either amountIn or amountOut must be provided',
      );
    }

    // Validate that both amountIn and amountOut are not provided
    if (request.amountIn && request.amountOut) {
      throw new ApiError(ErrorType.VALIDATION_ERROR, 'Cannot specify both amountIn and amountOut');
    }

    try {
      const endpoint = this.getEndpoint();
      const url = `${endpoint}/swap/route`;

      // Build query parameters
      const params: Record<string, string> = {
        tokenIn: request.tokenIn,
        tokenOut: request.tokenOut,
      };

      // Add amount parameter
      if (request.amountIn) {
        params.amountIn = request.amountIn;
      }
      if (request.amountOut) {
        params.amountOut = request.amountOut;
      }

      // Add optional parameters
      if (request.multiHop !== undefined) {
        params.multiHop = String(request.multiHop);
      }
      if (request.slippage !== undefined) {
        params.slippage = String(request.slippage);
      }
      if (request.unwrapWHYPE !== undefined) {
        params.unwrapWHYPE = String(request.unwrapWHYPE);
      }
      if (request.excludeDexes) {
        params.excludeDexes = request.excludeDexes;
      }
      if (request.feeBps !== undefined) {
        params.feeBps = String(request.feeBps);
      }
      if (request.feeRecipient) {
        params.feeRecipient = request.feeRecipient;
      }

      const response = await httpClient.get<SwapRouteResponse>(url, {
        params,
        timeout: API_TIMEOUTS.SWAP_ROUTE,
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError, 'Failed to find swap route');
    }
  }

  /**
   * Fetch available tokens for swapping
   * @param request - Fetch tokens request parameters
   * @returns Tokens response with list of available tokens
   */
  async fetchTokens(request: FetchTokensRequest = {}): Promise<TokensResponse> {
    try {
      const endpoint = this.getEndpoint();
      const url = `${endpoint}/tokens`;

      const params: Record<string, string> = {};

      // Add optional parameters
      if (request.search) {
        params.search = request.search;
      }
      if (request.limit !== undefined) {
        params.limit = String(request.limit);
      }
      if (request.offset !== undefined) {
        params.offset = String(request.offset);
      }

      const response = await httpClient.get<TokensResponse>(url, {
        params,
        timeout: API_TIMEOUTS.DEFAULT,
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError, 'Failed to fetch tokens');
    }
  }

  /**
   * Fetch token balances for a wallet address
   * @param wallet - Wallet address
   * @param limit - Optional limit for number of balances to return
   * @returns Balances response with token balances
   */
  async fetchBalances(wallet: string, limit?: number): Promise<BalancesResponse> {
    // Validate wallet address
    if (!wallet || wallet.trim() === '') {
      throw new ApiError(ErrorType.VALIDATION_ERROR, 'Wallet address is required');
    }

    // Validate address format (basic check for 0x prefix and length)
    if (!wallet.startsWith('0x') || wallet.length !== 42) {
      throw new ApiError(ErrorType.VALIDATION_ERROR, 'Invalid wallet address format');
    }

    try {
      const endpoint = this.getEndpoint();
      const url = `${endpoint}/balances`;

      const params: Record<string, string> = {
        wallet,
      };

      if (limit !== undefined) {
        params.limit = String(limit);
      }

      const response = await httpClient.get<BalancesResponse>(url, {
        params,
        timeout: API_TIMEOUTS.DEFAULT,
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError, 'Failed to fetch balances');
    }
  }

  /**
   * Handle API errors and convert to ApiError
   */
  private handleError(error: AxiosError, defaultMessage: string): ApiError {
    if (error.response) {
      // Server responded with error status
      const statusCode = error.response.status;
      const message =
        (error.response.data as any)?.message ||
        (error.response.data as any)?.error ||
        defaultMessage;

      if (statusCode === 400) {
        return new ApiError(ErrorType.VALIDATION_ERROR, message, statusCode, error);
      }
      if (statusCode === 429) {
        return new ApiError(
          ErrorType.RATE_LIMIT_ERROR,
          'Rate limit exceeded',
          statusCode,
          error,
          true,
        );
      }
      if (statusCode >= 500) {
        return new ApiError(ErrorType.API_ERROR, 'Server error', statusCode, error, true);
      }

      return new ApiError(ErrorType.API_ERROR, message, statusCode, error);
    }

    if (error.code === 'ECONNABORTED') {
      return new ApiError(ErrorType.TIMEOUT_ERROR, 'Request timeout', undefined, error, true);
    }

    if (error.request) {
      return new ApiError(ErrorType.NETWORK_ERROR, 'Network error', undefined, error, true);
    }

    return new ApiError(ErrorType.UNKNOWN_ERROR, defaultMessage, undefined, error);
  }
}

// Export singleton instance
export const liquidswapService = new LiquidSwapService();
export default liquidswapService;
