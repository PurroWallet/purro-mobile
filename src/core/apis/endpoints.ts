/**
 * API Endpoints Configuration
 * Centralized configuration for all external API endpoints
 */

export interface NetworkEndpoints {
  alchemy: {
    ethereum: string;
    base: string;
    arbitrum: string;
  };
  hyperscan: string;
  liquidswap: string;
}

export const MAINNET_ENDPOINTS: NetworkEndpoints = {
  alchemy: {
    ethereum: 'https://eth-mainnet.g.alchemy.com/v2',
    base: 'https://base-mainnet.g.alchemy.com/v2',
    arbitrum: 'https://arb-mainnet.g.alchemy.com/v2',
  },
  hyperscan: 'https://explorer.hyperliquid.xyz/api/v2',
  liquidswap: 'https://api.hyperliquid.xyz/info',
};

export const TESTNET_ENDPOINTS: NetworkEndpoints = {
  alchemy: {
    ethereum: 'https://eth-sepolia.g.alchemy.com/v2',
    base: 'https://base-sepolia.g.alchemy.com/v2',
    arbitrum: 'https://arb-sepolia.g.alchemy.com/v2',
  },
  hyperscan: 'https://explorer-testnet.hyperliquid.xyz/api/v2',
  liquidswap: 'https://api.hyperliquid-testnet.xyz/info',
};

/**
 * Get endpoints based on network mode
 */
export function getEndpoints(isTestnet: boolean = false): NetworkEndpoints {
  return isTestnet ? TESTNET_ENDPOINTS : MAINNET_ENDPOINTS;
}

/**
 * API timeout configurations (in milliseconds)
 */
export const API_TIMEOUTS = {
  DEFAULT: 30000, // 30 seconds
  METADATA: 3000, // 3 seconds for metadata (fast fallback)
  SWAP_ROUTE: 10000, // 10 seconds for swap route finding
};

/**
 * Retry configuration
 */
export const RETRY_CONFIG = {
  MAX_RETRIES: 5,
  INITIAL_DELAY: 1000, // 1 second
  MAX_DELAY: 32000, // 32 seconds
  BACKOFF_MULTIPLIER: 2,
  JITTER_MAX: 1000, // Max jitter in ms
};

/**
 * Circuit breaker configuration
 */
export const CIRCUIT_BREAKER_CONFIG = {
  FAILURE_THRESHOLD: 8,
  SERVICE_UNAVAILABLE_THRESHOLD: 3,
  RESET_TIMEOUT: 120000, // 2 minutes
  SERVICE_UNAVAILABLE_TIMEOUT: 300000, // 5 minutes
};

/**
 * Cache configuration
 */
export const CACHE_CONFIG = {
  NFT_FRESHNESS_WINDOW: 300000, // 5 minutes
  TOKEN_METADATA_NO_EXPIRY: true,
};
