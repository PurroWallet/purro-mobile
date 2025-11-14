/**
 * HyperScan API Service
 * Service for fetching NFT collections, instances, and transaction history from HyperScan API
 */

import axios, { type AxiosError } from 'axios';
import { API_TIMEOUTS, getEndpoints } from '../endpoints';
import { ApiError, ErrorType } from '../errors';
import {
  isValidAddress,
  type NextPageParams,
  type NFTCollectionsResponse,
  type NFTInstancesResponse,
  type TokenTransfersResponse,
  type Transaction,
  type TransactionFilter,
  type TransactionsResponse,
} from './types';

/**
 * HyperScan Service Class
 */
class HyperScanService {
  private isTestnet: boolean = false;

  /**
   * Set network mode (mainnet/testnet)
   */
  setTestnetMode(isTestnet: boolean): void {
    this.isTestnet = isTestnet;
  }

  /**
   * Get HyperScan API endpoint
   */
  private getEndpoint(): string {
    return getEndpoints(this.isTestnet).hyperscan;
  }

  /**
   * Fetch NFT collections for a wallet address
   * @param address - Wallet address
   * @param nextPageParams - Pagination parameters
   * @returns NFT collections response with pagination
   */
  async fetchNFTCollections(
    address: string,
    nextPageParams?: NextPageParams,
  ): Promise<NFTCollectionsResponse> {
    // Validate address
    if (!isValidAddress(address)) {
      throw new ApiError(ErrorType.VALIDATION_ERROR, `Invalid address format: ${address}`);
    }

    try {
      const endpoint = this.getEndpoint();
      const url = `${endpoint}/addresses/${address}/nft/collections`;

      const params: Record<string, string> = {};

      // Add pagination parameters if provided
      if (nextPageParams) {
        if (nextPageParams.token_contract_address_hash) {
          params.token_contract_address_hash = nextPageParams.token_contract_address_hash;
        }
        if (nextPageParams.token_type) {
          params.token_type = nextPageParams.token_type;
        }
        if (nextPageParams.items_count !== undefined) {
          params.items_count = String(nextPageParams.items_count);
        }
      }

      const response = await axios.get<NFTCollectionsResponse>(url, {
        params,
        timeout: API_TIMEOUTS.DEFAULT,
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError, 'Failed to fetch NFT collections');
    }
  }

  /**
   * Fetch NFT instances for a specific collection
   * @param tokenAddress - NFT contract address
   * @param holderAddress - Wallet address holding the NFTs
   * @param nextPageParams - Pagination parameters
   * @returns NFT instances response with pagination
   */
  async fetchNFTInstances(
    tokenAddress: string,
    holderAddress: string,
    nextPageParams?: NextPageParams,
  ): Promise<NFTInstancesResponse> {
    // Validate addresses
    if (!isValidAddress(tokenAddress)) {
      throw new ApiError(
        ErrorType.VALIDATION_ERROR,
        `Invalid token address format: ${tokenAddress}`,
      );
    }
    if (!isValidAddress(holderAddress)) {
      throw new ApiError(
        ErrorType.VALIDATION_ERROR,
        `Invalid holder address format: ${holderAddress}`,
      );
    }

    try {
      const endpoint = this.getEndpoint();
      const url = `${endpoint}/tokens/${tokenAddress}/instances`;

      const params: Record<string, string> = {
        holder_address_hash: holderAddress,
      };

      // Add pagination parameters if provided
      if (nextPageParams) {
        if (nextPageParams.token_id) {
          params.token_id = nextPageParams.token_id;
        }
        if (nextPageParams.items_count !== undefined) {
          params.items_count = String(nextPageParams.items_count);
        }
      }

      const response = await axios.get<NFTInstancesResponse>(url, {
        params,
        timeout: API_TIMEOUTS.DEFAULT,
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError, 'Failed to fetch NFT instances');
    }
  }

  /**
   * Fetch transaction history for the last 30 days
   * @param address - Wallet address
   * @returns Transactions response
   */
  async fetchTransactions(address: string): Promise<TransactionsResponse> {
    // Validate address
    if (!isValidAddress(address)) {
      throw new ApiError(ErrorType.VALIDATION_ERROR, `Invalid address format: ${address}`);
    }

    try {
      const endpoint = this.getEndpoint();
      const url = `${endpoint}/addresses/${address}/transactions`;

      // Calculate timestamp for 30 days ago
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const timestamp = Math.floor(thirtyDaysAgo.getTime() / 1000);

      const params = {
        filter: 'to | from',
        start_timestamp: String(timestamp),
      };

      const response = await axios.get<TransactionsResponse>(url, {
        params,
        timeout: API_TIMEOUTS.DEFAULT,
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError, 'Failed to fetch transactions');
    }
  }

  /**
   * Fetch single transaction details by hash
   * @param txHash - Transaction hash
   * @returns Transaction details
   */
  async fetchTransactionDetails(txHash: string): Promise<Transaction> {
    // Validate transaction hash format
    if (!txHash || !txHash.startsWith('0x')) {
      throw new ApiError(ErrorType.VALIDATION_ERROR, `Invalid transaction hash format: ${txHash}`);
    }

    try {
      const endpoint = this.getEndpoint();
      const url = `${endpoint}/transactions/${txHash}`;

      const response = await axios.get<Transaction>(url, {
        timeout: API_TIMEOUTS.DEFAULT,
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError, 'Failed to fetch transaction details');
    }
  }

  /**
   * Fetch token transfer events
   * @param address - Wallet address
   * @param filter - Filter type ('from', 'to', or 'both')
   * @param nextPageParams - Pagination parameters
   * @returns Token transfers response with pagination
   */
  async fetchTokenTransfers(
    address: string,
    filter: TransactionFilter = 'both',
    nextPageParams?: NextPageParams,
  ): Promise<TokenTransfersResponse> {
    // Validate address
    if (!isValidAddress(address)) {
      throw new ApiError(ErrorType.VALIDATION_ERROR, `Invalid address format: ${address}`);
    }

    try {
      const endpoint = this.getEndpoint();
      const url = `${endpoint}/addresses/${address}/token-transfers`;

      const params: Record<string, string> = {};

      // Add filter parameter
      if (filter === 'from') {
        params.filter = 'from';
      } else if (filter === 'to') {
        params.filter = 'to';
      } else {
        params.filter = 'to | from';
      }

      // Add pagination parameters if provided
      if (nextPageParams) {
        if (nextPageParams.items_count !== undefined) {
          params.items_count = String(nextPageParams.items_count);
        }
        // Token transfers use block_number for pagination
        if (nextPageParams.token_contract_address_hash) {
          params.block_number = nextPageParams.token_contract_address_hash;
        }
      }

      const response = await axios.get<TokenTransfersResponse>(url, {
        params,
        timeout: API_TIMEOUTS.DEFAULT,
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error as AxiosError, 'Failed to fetch token transfers');
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
export const hyperscanService = new HyperScanService();
export default hyperscanService;
