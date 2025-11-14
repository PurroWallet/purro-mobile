// Re-export keychain for biometric setup
export { secureKeychain as apisKeychain } from '../services/Keychain';
// Alchemy API Service
export {
  CircuitBreaker,
  executeWithCircuitBreaker,
  fetchAllEvmTokens,
  fetchArbitrumTokens,
  fetchBaseTokens,
  fetchBatchTokenMetadata,
  fetchEthereumTokens,
  fetchTokenBalances,
  fetchTokenMetadata,
} from './alchemy';
// Alchemy API Types
export type {
  AlchemyTokenBalancesRequest,
  AlchemyTokenBalancesResponse,
  AlchemyTokenMetadataRequest,
  AlchemyTokenMetadataResponse,
  ChainTokenData,
  TokenBalance,
  TokenMetadata,
  TokenWithMetadata,
} from './alchemy/types';
export { FALLBACK_TOKEN_METADATA } from './alchemy/types';

// API Endpoints Configuration
export {
  API_TIMEOUTS,
  CACHE_CONFIG,
  CIRCUIT_BREAKER_CONFIG,
  getEndpoints,
  MAINNET_ENDPOINTS,
  type NetworkEndpoints,
  RETRY_CONFIG,
  TESTNET_ENDPOINTS,
} from './endpoints';

// Error Types and Utilities
export {
  ApiError,
  calculateRetryDelay,
  createApiError,
  ErrorType,
  getUserFriendlyErrorMessage,
  isRateLimitError,
  isRetryableError,
  isServiceUnavailableError,
  sleep,
} from './errors';
// HTTP Client for HTTPS API calls
export { httpClient } from './httpClient';
// HyperScan API Service
export { hyperscanService } from './hyperscan';
// HyperScan API Types
export type {
  AddressHash,
  NextPageParams,
  NFTCollection,
  NFTCollectionsResponse,
  NFTInstance,
  NFTInstancesResponse,
  NFTMetadata,
  NFTToken,
  TokenInfo,
  TokenTransfer,
  TokenTransfersResponse,
  TokenTransferTotal,
  Transaction,
  TransactionFee,
  TransactionFilter,
  TransactionGroup,
  TransactionsResponse,
} from './hyperscan/types';
export { ADDRESS_REGEX, isValidAddress } from './hyperscan/types';
// LiquidSwap API Types
export type {
  BalancesRequest,
  BalancesResponse,
  FetchTokensRequest,
  SwapExecutionParams,
  SwapExecutionResult,
  SwapRoute,
  SwapRouteHop,
  SwapRouteRequest,
  SwapRouteResponse,
  SwapTransaction,
  Token,
  TokenBalance as SwapTokenBalance,
  TokensResponse,
} from './liquidswap/types';
export { DEFAULT_SLIPPAGE, MAX_SLIPPAGE, MIN_SLIPPAGE } from './liquidswap/types';
// Re-export legacy lock APIs if needed
export { apisLock } from './lock';
export { apisWallet } from './wallet';
