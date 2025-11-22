/**
 * HyperScan API Type Definitions
 * Types for NFT collections, instances, and transaction history
 */

/**
 * Pagination parameters for HyperScan API
 */
export interface NextPageParams {
  token_contract_address_hash?: string;
  token_type?: string;
  items_count?: number;
  token_id?: string;
  // Etherscan pagination
  page?: number;
  offset?: number;
}

/**
 * NFT token information
 */
export interface NFTToken {
  address: string;
  name: string;
  symbol: string;
  type: 'ERC-721' | 'ERC-1155';
}

/**
 * NFT instance metadata
 */
export interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

/**
 * NFT instance details
 */
export interface NFTInstance {
  id: string;
  token_id: string;
  metadata?: NFTMetadata;
}

/**
 * NFT collection
 */
export interface NFTCollection {
  token: NFTToken;
  amount: string;
  token_instances?: NFTInstance[];
}

/**
 * NFT collections API response
 */
export interface NFTCollectionsResponse {
  items: NFTCollection[];
  next_page_params: NextPageParams | null;
}

/**
 * NFT instances API response
 */
export interface NFTInstancesResponse {
  items: NFTInstance[];
  next_page_params: NextPageParams | null;
}

/**
 * Address hash object
 */
export interface AddressHash {
  hash: string;
}

/**
 * Transaction fee information
 */
export interface TransactionFee {
  value: string;
}

/**
 * Transaction details
 */
export interface Transaction {
  hash: string;
  from: AddressHash;
  to: AddressHash;
  value: string;
  timestamp: string;
  status: 'ok' | 'error';
  method?: string;
  fee?: TransactionFee;
}

/**
 * Transactions API response
 */
export interface TransactionsResponse {
  items: Transaction[];
  next_page_params: NextPageParams | null;
}

/**
 * Token information for transfers
 */
export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: string;
}

/**
 * Token transfer total
 */
export interface TokenTransferTotal {
  value: string;
  decimals: string;
}

/**
 * Token transfer event
 */
export interface TokenTransfer {
  block_number: number;
  from: AddressHash;
  to: AddressHash;
  token: TokenInfo;
  total: TokenTransferTotal;
  timestamp: string;
  tx_hash: string;
}

/**
 * Token transfers API response
 */
export interface TokenTransfersResponse {
  items: TokenTransfer[];
  next_page_params: NextPageParams | null;
}

/**
 * Transaction filter type
 */
export type TransactionFilter = 'from' | 'to' | 'both';

/**
 * Transaction grouped by date
 */
export interface TransactionGroup {
  date: string;
  transactions: Transaction[];
}

/**
 * Token transfer grouped by date
 */
export interface TokenTransferGroup {
  date: string;
  transactions: TokenTransfer[];
}

/**
 * Address validation regex
 */
export const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

/**
 * Validate Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  return ADDRESS_REGEX.test(address);
}
