/**
 * Hyperliquid API Type Definitions
 * Types for clearinghouse state, positions, and account information
 */

/**
 * Hyperliquid API request for clearinghouse state
 */
export interface ClearinghouseStateRequest {
  type: 'clearinghouseState';
  user: string;
  dex?: string;
}

/**
 * Asset position in the clearinghouse
 */
export interface AssetPosition {
  position: {
    coin: string;
    entryPx: string;
    leverage: {
      type: string;
      value: number;
    };
    liquidationPx: string | null;
    marginUsed: string;
    maxTradeSzs: [string, string];
    positionValue: string;
    returnOnEquity: string;
    szi: string;
    unrealizedPnl: string;
  };
  type: 'oneWay';
}

/**
 * Cross margin summary
 */
export interface CrossMarginSummary {
  accountValue: string;
  totalMarginUsed: string;
  totalNtlPos: string;
  totalRawUsd: string;
  withdrawable: string;
}

/**
 * Margin summary
 */
export interface MarginSummary {
  accountValue: string;
  totalMarginUsed: string;
  totalNtlPos: string;
  totalRawUsd: string;
  withdrawable: string;
}

/**
 * Clearinghouse state response
 */
export interface ClearinghouseState {
  assetPositions: AssetPosition[];
  crossMarginSummary: CrossMarginSummary;
  marginSummary: MarginSummary;
  time: number;
  withdrawable: string;
}

/**
 * Formatted position for UI display
 */
export interface FormattedPosition {
  id: string;
  coin: string;
  size: string;
  entryPrice: string;
  leverage: number;
  marginUsed: string;
  positionValue: string;
  unrealizedPnl: string;
  isPositive: boolean;
}

/**
 * Account metrics for UI display
 */
export interface AccountMetrics {
  accountValue: string;
  marginUsed: string;
  totalPosition: string;
  withdrawable: string;
}

/**
 * Spot clearinghouse state request
 */
export interface SpotClearinghouseStateRequest {
  type: 'spotClearinghouseState';
  user: string;
}

/**
 * Spot balance
 */
export interface SpotBalance {
  coin: string;
  token: number;
  total: string;
  hold: string;
  entryNtl: string;
}

/**
 * Spot clearinghouse state response
 */
export interface SpotClearinghouseState {
  balances: SpotBalance[];
}

/**
 * Formatted spot token for UI display
 */
export interface FormattedSpotToken {
  id: string;
  name: string;
  symbol: string;
  balance: string;
  value: string;
  token: number;
  imageUrl: string;
}

/**
 * Spot meta request
 */
export interface SpotMetaRequest {
  type: 'spotMeta';
}

/**
 * Spot token metadata
 */
export interface SpotTokenMetadata {
  name: string;
  szDecimals: number;
  weiDecimals: number;
  index: number;
  tokenId: string;
  isCanonical: boolean;
}

/**
 * Spot meta response
 */
export interface SpotMetaResponse {
  tokens: SpotTokenMetadata[];
  universe: Array<{
    tokens: number[];
    name: string;
    index: number;
  }>;
}

/**
 * All mids request (for prices)
 */
export interface AllMidsRequest {
  type: 'allMids';
}

/**
 * All mids response (token prices)
 */
export interface AllMidsResponse {
  [key: string]: string; // e.g., "BTC": "50000.0"
}

/**
 * Validate Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
