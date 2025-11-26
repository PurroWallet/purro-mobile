/**
 * Hyperliquid API Service
 * Service for fetching clearinghouse state and account information from Hyperliquid DEX
 */

import { type AxiosError } from 'axios';
import { API_TIMEOUTS, getEndpoints } from '../endpoints';
import { ApiError, ErrorType } from '../errors';
import { httpClient } from '../httpClient';
import {
  type AccountMetrics,
  type ClearinghouseState,
  type ClearinghouseStateRequest,
  type FormattedPosition,
  isValidAddress,
} from './types';

/**
 * Hyperliquid Service Class
 */
class HyperliquidService {
  private isTestnet: boolean = false;

  /**
   * Set network mode (mainnet/testnet)
   */
  setTestnetMode(isTestnet: boolean): void {
    this.isTestnet = isTestnet;
  }

  /**
   * Get Hyperliquid API endpoint
   */
  private getEndpoint(): string {
    return getEndpoints(this.isTestnet).liquidswap;
  }

  /**
   * Fetch clearinghouse state for a wallet address
   * @param address - Wallet address
   * @returns Clearinghouse state with positions and account info
   */
  async fetchClearinghouseState(address: string): Promise<ClearinghouseState> {
    // Validate address
    if (!isValidAddress(address)) {
      throw new ApiError(ErrorType.VALIDATION_ERROR, `Invalid address format: ${address}`);
    }

    try {
      const endpoint = this.getEndpoint();

      const requestBody: ClearinghouseStateRequest = {
        type: 'clearinghouseState',
        user: address,
        dex: '',
      };

      const response = await httpClient.post<ClearinghouseState>(endpoint, requestBody, {
        timeout: API_TIMEOUTS.DEFAULT,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError, 'Failed to fetch clearinghouse state');
    }
  }

  /**
   * Get formatted account metrics from clearinghouse state
   * @param state - Clearinghouse state
   * @returns Formatted account metrics
   */
  getAccountMetrics(state: ClearinghouseState): AccountMetrics {
    const { marginSummary } = state;

    return {
      accountValue: this.formatCurrency(marginSummary.accountValue),
      marginUsed: this.formatCurrency(marginSummary.totalMarginUsed),
      totalPosition: this.formatCurrency(marginSummary.totalNtlPos),
      withdrawable: this.formatCurrency(state.withdrawable),
    };
  }

  /**
   * Get formatted positions from clearinghouse state
   * @param state - Clearinghouse state
   * @returns Array of formatted positions
   */
  getFormattedPositions(state: ClearinghouseState): FormattedPosition[] {
    return state.assetPositions.map((assetPos, index) => {
      const { position } = assetPos;
      const unrealizedPnl = parseFloat(position.unrealizedPnl);

      return {
        id: `${position.coin}-${index}`,
        coin: position.coin,
        size: position.szi,
        entryPrice: this.formatPrice(position.entryPx),
        leverage: position.leverage.value,
        marginUsed: this.formatCurrency(position.marginUsed),
        positionValue: this.formatCurrency(position.positionValue),
        unrealizedPnl: this.formatCurrency(position.unrealizedPnl),
        isPositive: unrealizedPnl >= 0,
      };
    });
  }

  /**
   * Format currency value for display
   * @param value - Raw value string
   * @returns Formatted currency string
   */
  private formatCurrency(value: string): string {
    const num = parseFloat(value);
    if (isNaN(num)) return '$0.00';

    return `$${num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  /**
   * Format price value for display
   * @param value - Raw value string
   * @returns Formatted price string
   */
  private formatPrice(value: string): string {
    const num = parseFloat(value);
    if (isNaN(num)) return '$0.00';

    // Use more decimals for small prices
    const decimals = num < 1 ? 4 : 2;

    return `$${num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  }

  /**
   * Fetch spot clearinghouse state for a wallet address
   * @param address - Wallet address
   * @returns Spot clearinghouse state with token balances
   */
  async fetchSpotClearinghouseState(
    address: string,
  ): Promise<import('./types').SpotClearinghouseState> {
    // Validate address
    if (!isValidAddress(address)) {
      throw new ApiError(ErrorType.VALIDATION_ERROR, `Invalid address format: ${address}`);
    }

    try {
      const endpoint = this.getEndpoint();

      const requestBody: import('./types').SpotClearinghouseStateRequest = {
        type: 'spotClearinghouseState',
        user: address,
      };

      const response = await httpClient.post<import('./types').SpotClearinghouseState>(
        endpoint,
        requestBody,
        {
          timeout: API_TIMEOUTS.DEFAULT,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError, 'Failed to fetch spot clearinghouse state');
    }
  }

  /**
   * Get formatted spot tokens from spot clearinghouse state
   * @param state - Spot clearinghouse state
   * @param prices - Token prices (optional)
   * @returns Array of formatted spot tokens
   */
  getFormattedSpotTokens(
    state: import('./types').SpotClearinghouseState,
    prices?: import('./types').AllMidsResponse,
  ): import('./types').FormattedSpotToken[] {
    return state.balances.map((balance) => {
      // Calculate value: balance * price
      let usdValue = 0;
      const balanceNum = parseFloat(balance.total);

      // USDC is a stablecoin, always $1
      if (balance.coin === 'USDC') {
        usdValue = balanceNum * 1;
        console.log(
          `Token ${balance.coin}: balance=${balanceNum}, price=1 (stablecoin), value=${usdValue}`,
        );
      } else if (prices && prices[balance.coin]) {
        const price = parseFloat(prices[balance.coin]);
        usdValue = balanceNum * price;
        console.log(
          `Token ${balance.coin}: balance=${balanceNum}, price=${price}, value=${usdValue}`,
        );
      } else {
        // Fallback to entryNtl if no price available
        usdValue = parseFloat(balance.entryNtl);
        console.log(`Token ${balance.coin}: using entryNtl=${usdValue}`);
      }

      return {
        id: `${balance.coin}-${balance.token}`,
        name: balance.coin,
        symbol: balance.coin,
        balance: balance.total,
        value: this.formatCurrency(usdValue.toString()),
        token: balance.token,
        imageUrl: this.getSpotTokenImage(balance.coin),
      };
    });
  }

  /**
   * Calculate total balance from spot tokens
   * @param tokens - Array of formatted spot tokens
   * @returns Total balance as formatted currency string
   */
  calculateSpotTotalBalance(tokens: import('./types').FormattedSpotToken[]): string {
    const total = tokens.reduce((sum, token) => {
      const cleanValue = token.value.replace(/\$/g, '').replace(/,/g, '');
      const value = parseFloat(cleanValue);
      return sum + (isNaN(value) ? 0 : value);
    }, 0);

    return this.formatCurrency(total.toString());
  }

  /**
   * Get spot token image URL
   * @param token - Token symbol
   * @returns Image URL for the token
   */
  getSpotTokenImage(token: string): string {
    if (token === 'USDC') {
      return 'https://app.hyperliquid.xyz/coins/USDC.svg';
    }
    if (token.includes('USD')) {
      return `https://app.hyperliquid.xyz/coins/${token}_USDC.svg`;
    }
    if (token.startsWith('U')) {
      const tokenFormat = token.slice(1);
      return `https://app.hyperliquid.xyz/coins/${tokenFormat}_USDC.svg`;
    }
    return `https://app.hyperliquid.xyz/coins/${token}_USDC.svg`;
  }

  /**
   * Fetch spot metadata (token info)
   * @returns Spot metadata with token information
   */
  async fetchSpotMeta(): Promise<import('./types').SpotMetaResponse> {
    try {
      const endpoint = this.getEndpoint();

      const requestBody: import('./types').SpotMetaRequest = {
        type: 'spotMeta',
      };

      const response = await httpClient.post<import('./types').SpotMetaResponse>(
        endpoint,
        requestBody,
        {
          timeout: API_TIMEOUTS.DEFAULT,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError, 'Failed to fetch spot metadata');
    }
  }

  /**
   * Fetch all mid prices for spot tokens
   * @returns Object with token prices
   */
  async fetchAllMids(): Promise<import('./types').AllMidsResponse> {
    try {
      const endpoint = this.getEndpoint();

      const requestBody: import('./types').AllMidsRequest = {
        type: 'allMids',
      };

      const response = await httpClient.post<import('./types').AllMidsResponse>(
        endpoint,
        requestBody,
        {
          timeout: API_TIMEOUTS.DEFAULT,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError, 'Failed to fetch token prices');
    }
  }

  /**
   * Handle API errors and convert to ApiError
   */
  private handleError(error: AxiosError, defaultMessage: string): ApiError {
    if (error.response) {
      // Server responded with error status
      const statusCode = error.response.status;
      const message = (error.response.data as any)?.message || defaultMessage;

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
export const hyperliquidService = new HyperliquidService();
export default HyperliquidService;
