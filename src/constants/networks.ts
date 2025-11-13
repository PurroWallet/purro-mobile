/**
 * Network Configuration
 * Defines supported networks and RPC endpoints
 */
export const ENDPOINTS_TOKEN = {
  HYPERLIQUID_L1: 'https://api.hyperliquid.xyz',
  HYPEREVM_MAINNET: 'https://www.hyperscan.com/api/v2',
  GECKO_TERMINAL: 'https://api.geckoterminal.com/api/v2',
  ALCHEMY_ETH_MAINNET: 'https://eth-mainnet.g.alchemy.com/v2/pQZCrFA4q__RcYkvhoPOHUivAjmSIgyF',
  ALCHEMY_BASE_MAINNET: 'https://base-mainnet.g.alchemy.com/v2/pQZCrFA4q__RcYkvhoPOHUivAjmSIgyF',
  ALCHEMY_ARB_MAINNET: 'https://arb-mainnet.g.alchemy.com/v2/pQZCrFA4q__RcYkvhoPOHUivAjmSIgyF',
  HL_NAME_API_BASE: 'https://api.hlnames.xyz',
  LIQUID_SWAP: 'https://api.liqd.ag',
  ETHERSCAN: 'https://api.etherscan.io/v2/api',
  GLUEX: 'https://router.gluex.xyz',
  TOKENS_GLUEX: 'https://tokens.gluex.xyz',
};

export enum NetworkType {
  HYPERLIQUID = 'hyperliquid',
  ETHEREUM = 'ethereum',
  BASE = 'base',
  ARBITRUM = 'arbitrum',
}

export interface NetworkConfig {
  id: string;
  name: string;
  chainId: number;
  type: NetworkType;
  rpcUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrl: string;
  enabled: boolean;
}

/**
 * Network configurations
 * Priority: Ethereum Mainnet
 */
export const NETWORKS: Record<NetworkType, NetworkConfig> = {
  [NetworkType.HYPERLIQUID]: {
    id: 'hyperliquid-mainnet',
    name: 'Hyperliquid',
    chainId: 998,
    type: NetworkType.HYPERLIQUID,
    rpcUrls: ['https://api.hyperliquid.xyz/evm', 'https://rpc.hyperliquid.xyz'],
    nativeCurrency: {
      name: 'Hyperliquid',
      symbol: 'HYPE',
      decimals: 18,
    },
    blockExplorerUrl: 'https://hyperscan.io',
    enabled: true,
  },
  [NetworkType.ETHEREUM]: {
    id: 'ethereum-mainnet',
    name: 'Ethereum',
    chainId: 1,
    type: NetworkType.ETHEREUM,
    rpcUrls: [
      ENDPOINTS_TOKEN.ALCHEMY_ETH_MAINNET,
      'https://rpc.ankr.com/eth',
      'https://ethereum.publicnode.com',
    ],
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrl: 'https://etherscan.io',
    enabled: true,
  },
  [NetworkType.BASE]: {
    id: 'base-mainnet',
    name: 'Base',
    chainId: 8453,
    type: NetworkType.BASE,
    rpcUrls: [
      ENDPOINTS_TOKEN.ALCHEMY_BASE_MAINNET,
      'https://mainnet.base.org',
      'https://base.publicnode.com',
    ],
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrl: 'https://basescan.org',
    enabled: true,
  },
  [NetworkType.ARBITRUM]: {
    id: 'arbitrum-mainnet',
    name: 'Arbitrum One',
    chainId: 42161,
    type: NetworkType.ARBITRUM,
    rpcUrls: [ENDPOINTS_TOKEN.ALCHEMY_ARB_MAINNET, 'https://arb1.arbitrum.io/rpc'],
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorerUrl: 'https://arbiscan.io',
    enabled: true,
  },
};

/**
 * Default network (Ethereum Mainnet)
 */
export const DEFAULT_NETWORK = NetworkType.ETHEREUM;

/**
 * Gas fee strategies
 */
export enum GasStrategy {
  FAST = 'fast',
  STANDARD = 'standard',
}

// Export as type alias for compatibility
export type { GasStrategy as GAS_STRATEGY };

/**
 * Gas multipliers for strategies
 */
export const GAS_MULTIPLIERS = {
  [GasStrategy.FAST]: 1.2, // 20% faster
  [GasStrategy.STANDARD]: 1.0, // Standard speed
};

/**
 * API endpoints for token prices and data
 */
export const API_ENDPOINTS = {
  // CoinGecko for token prices
  COINGECKO_API: 'https://api.coingecko.com/api/v3',

  // Your backend API for transaction history
  BACKEND_API: process.env.BACKEND_API_URL || 'https://api.yourbackend.com',

  // Token lists
  TOKEN_LIST: 'https://tokens.coingecko.com/uniswap/all.json',
};

/**
 * Common ERC20 tokens on Ethereum
 */
export const COMMON_TOKENS = {
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  LINK: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
  UNI: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
};

/**
 * Transaction confirmation blocks
 */
export const CONFIRMATION_BLOCKS = 12;

/**
 * Max slippage for swaps (percentage)
 */
export const MAX_SLIPPAGE = 0.5; // 0.5%
