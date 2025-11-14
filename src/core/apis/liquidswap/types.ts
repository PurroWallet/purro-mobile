/**
 * LiquidSwap API Type Definitions
 * Types for token swap route finding and execution
 */

/**
 * Token information
 */
export interface Token {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
}

/**
 * Swap route hop
 */
export interface SwapRouteHop {
  dex: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
}

/**
 * Swap transaction data
 */
export interface SwapTransaction {
  to: string;
  data: string;
  value: string;
}

/**
 * Swap route details
 */
export interface SwapRoute {
  amountIn: string;
  amountOut: string;
  priceImpact: number;
  route: SwapRouteHop[];
  transaction: SwapTransaction;
}

/**
 * Swap route request parameters
 */
export interface SwapRouteRequest {
  tokenIn: string;
  tokenOut: string;
  amountIn?: string;
  amountOut?: string;
  multiHop?: boolean;
  slippage?: number;
  unwrapWHYPE?: boolean;
  excludeDexes?: string;
  feeBps?: number;
  feeRecipient?: string;
}

/**
 * Swap route API response
 */
export interface SwapRouteResponse {
  success: boolean;
  data?: SwapRoute;
  error?: string;
}

/**
 * Fetch tokens request parameters
 */
export interface FetchTokensRequest {
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Tokens API response
 */
export interface TokensResponse {
  tokens: Token[];
  total: number;
}

/**
 * Token balance information
 */
export interface TokenBalance {
  token: Token;
  balance: string;
  balanceUSD?: string;
}

/**
 * Balances request parameters
 */
export interface BalancesRequest {
  wallet: string;
  limit?: number;
}

/**
 * Balances API response
 */
export interface BalancesResponse {
  balances: TokenBalance[];
  totalUSD?: string;
}

/**
 * Swap execution parameters
 */
export interface SwapExecutionParams {
  route: SwapRoute;
  fromAddress: string;
  slippage: number;
}

/**
 * Swap execution result
 */
export interface SwapExecutionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

/**
 * Default slippage tolerance (0.5%)
 */
export const DEFAULT_SLIPPAGE = 0.5;

/**
 * Maximum slippage tolerance (50%)
 */
export const MAX_SLIPPAGE = 50;

/**
 * Minimum slippage tolerance (0.1%)
 */
export const MIN_SLIPPAGE = 0.1;
