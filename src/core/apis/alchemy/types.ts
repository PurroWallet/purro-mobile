/**
 * Alchemy API Type Definitions
 * Types for EVM token balance and metadata fetching
 */

/**
 * Token metadata information
 */
export interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  logo?: string;
}

/**
 * Token balance from Alchemy API
 */
export interface TokenBalance {
  contractAddress: string;
  balance: string;
  error?: string;
}

/**
 * Token with metadata combined
 */
export interface TokenWithMetadata {
  contractAddress: string;
  balance: string;
  metadata: TokenMetadata;
}

/**
 * Chain-specific token data
 */
export interface ChainTokenData {
  chain: 'ethereum' | 'base' | 'arbitrum';
  tokens: TokenWithMetadata[];
  isLoading?: boolean;
  error?: string;
}

/**
 * Alchemy API request for token balances
 */
export interface AlchemyTokenBalancesRequest {
  jsonrpc: string;
  id: number;
  method: string;
  params: [string]; // [address]
}

/**
 * Alchemy API response for token balances
 */
export interface AlchemyTokenBalancesResponse {
  jsonrpc: string;
  id: number;
  result: {
    address: string;
    tokenBalances: Array<{
      contractAddress: string;
      tokenBalance: string;
      error?: string;
    }>;
  };
}

/**
 * Alchemy API request for token metadata
 */
export interface AlchemyTokenMetadataRequest {
  jsonrpc: string;
  id: number;
  method: string;
  params: [string]; // [contractAddress]
}

/**
 * Alchemy API response for token metadata
 */
export interface AlchemyTokenMetadataResponse {
  jsonrpc: string;
  id: number;
  result: {
    name: string;
    symbol: string;
    decimals: number;
    logo?: string;
  };
}

/**
 * Fallback token metadata for unknown tokens
 */
export const FALLBACK_TOKEN_METADATA: TokenMetadata = {
  name: 'Unknown Token',
  symbol: 'UNKNOWN',
  decimals: 18,
};
