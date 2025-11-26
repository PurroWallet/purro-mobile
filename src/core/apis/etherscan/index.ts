/**
 * Etherscan API Module
 * Exports service and types for Etherscan API
 */

export {
  CHAIN_NAMES,
  default as EtherscanService,
  etherscanService,
  type SupportedChainId,
} from './etherscanService';
export * from './types';
