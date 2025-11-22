import { API_ENDPOINTS, type NetworkType } from '@/constants/networks';
import { httpClient } from '@/core/apis/httpClient';
import type { TransactionResult } from './TransactionService';

export interface TransactionHistory extends TransactionResult {
  id?: string;
  networkType: NetworkType;
  gasFeeUSD?: number;
  notes?: string;
}

export interface TransactionFilter {
  address?: string;
  networkType?: NetworkType;
  status?: 'pending' | 'confirmed' | 'failed';
  tokenAddress?: string;
  limit?: number;
  offset?: number;
}

/**
 * Transaction History Service
 * Manages transaction history with backend API integration
 */
export class TransactionHistoryService {
  private readonly apiUrl = API_ENDPOINTS.BACKEND_API;

  /**
   * Save transaction to backend
   */
  async saveTransaction(transaction: TransactionResult, networkType?: NetworkType): Promise<void> {
    try {
      const payload: TransactionHistory = {
        ...transaction,
        networkType: networkType || ('ethereum' as NetworkType),
      };

      await httpClient.post(`${this.apiUrl}/transactions`, payload);
    } catch (error) {
      console.error('Failed to save transaction to backend:', error);
      // Don't throw - transaction still succeeded even if history save fails
    }
  }

  /**
   * Update transaction status
   */
  async updateTransaction(txHash: string, updates: Partial<TransactionResult>): Promise<void> {
    try {
      await httpClient.patch(`${this.apiUrl}/transactions/${txHash}`, updates);
    } catch (error) {
      console.error('Failed to update transaction:', error);
    }
  }

  /**
   * Get transaction history for address
   */
  async getTransactionHistory(filter: TransactionFilter): Promise<TransactionHistory[]> {
    try {
      const params = new URLSearchParams();

      if (filter.address) params.append('address', filter.address);
      if (filter.networkType) params.append('networkType', filter.networkType);
      if (filter.status) params.append('status', filter.status);
      if (filter.tokenAddress) params.append('tokenAddress', filter.tokenAddress);
      if (filter.limit) params.append('limit', filter.limit.toString());
      if (filter.offset) params.append('offset', filter.offset.toString());

      const response = await httpClient.get<TransactionHistory[]>(
        `${this.apiUrl}/transactions?${params.toString()}`,
      );

      const transactions = response.data;
      return transactions;
    } catch (error) {
      console.error('Failed to get transaction history:', error);
      return [];
    }
  }

  /**
   * Get transaction by hash
   */
  async getTransaction(txHash: string): Promise<TransactionHistory | null> {
    try {
      const response = await httpClient.get<TransactionHistory>(
        `${this.apiUrl}/transactions/${txHash}`,
      );

      const transaction = response.data;
      return transaction;
    } catch (error) {
      console.error('Failed to get transaction:', error);
      return null;
    }
  }

  /**
   * Get pending transactions for address
   */
  async getPendingTransactions(
    address: string,
    networkType?: NetworkType,
  ): Promise<TransactionHistory[]> {
    return this.getTransactionHistory({
      address,
      networkType,
      status: 'pending',
    });
  }

  /**
   * Delete transaction from history
   */
  async deleteTransaction(txHash: string): Promise<void> {
    try {
      await httpClient.delete(`${this.apiUrl}/transactions/${txHash}`);
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      throw error;
    }
  }

  /**
   * Clear all transaction history for address
   */
  async clearHistory(address: string): Promise<void> {
    try {
      await httpClient.delete(`${this.apiUrl}/transactions/clear/${address}`);
    } catch (error) {
      console.error('Failed to clear history:', error);
      throw error;
    }
  }

  /**
   * Add note to transaction
   */
  async addTransactionNote(txHash: string, note: string): Promise<void> {
    try {
      await this.updateTransaction(txHash, { notes: note } as any);
    } catch (error) {
      console.error('Failed to add transaction note:', error);
      throw error;
    }
  }

  /**
   * Get transaction statistics for address
   */
  async getTransactionStats(
    address: string,
    networkType?: NetworkType,
  ): Promise<{
    totalTransactions: number;
    pendingCount: number;
    confirmedCount: number;
    failedCount: number;
    totalVolume: number;
    totalFees: number;
  }> {
    try {
      const params = new URLSearchParams({ address });
      if (networkType) params.append('networkType', networkType);

      const response = await httpClient.get<{
        totalTransactions: number;
        pendingCount: number;
        confirmedCount: number;
        failedCount: number;
        totalVolume: number;
        totalFees: number;
      }>(`${this.apiUrl}/transactions/stats?${params.toString()}`);

      return response.data;
    } catch (error) {
      console.error('Failed to get transaction stats:', error);
      return {
        totalTransactions: 0,
        pendingCount: 0,
        confirmedCount: 0,
        failedCount: 0,
        totalVolume: 0,
        totalFees: 0,
      };
    }
  }
}

// Create and export singleton instance
export const transactionHistoryService = new TransactionHistoryService();
