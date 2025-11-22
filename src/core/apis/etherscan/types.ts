/**
 * Etherscan API Type Definitions
 */

/**
 * Etherscan pagination parameters
 */
export interface EtherscanPageParams {
  page: number;
  offset: number;
}

/**
 * Etherscan transaction from API
 */
export interface EtherscanTransaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  contractAddress: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  confirmations: string;
}

/**
 * Etherscan API response
 */
export interface EtherscanApiResponse {
  status: string; // "1" for success, "0" for error
  message: string; // "OK" or error message
  result: EtherscanTransaction[] | string;
}
