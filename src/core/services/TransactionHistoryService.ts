import { API_ENDPOINTS, type NetworkType } from '@/constants/networks';
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

      const response = await fetch(`${this.apiUrl}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to save transaction: ${response.status}`);
      }

      console.log('✅ Transaction saved to backend:', transaction.hash);
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
      const response = await fetch(`${this.apiUrl}/transactions/${txHash}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update transaction: ${response.status}`);
      }

      console.log('✅ Transaction updated:', txHash);
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

      const response = await fetch(`${this.apiUrl}/transactions?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch transaction history: ${response.status}`);
      }

      const transactions: TransactionHistory[] = await response.json();
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
      const response = await fetch(`${this.apiUrl}/transactions/${txHash}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch transaction: ${response.status}`);
      }

      const transaction: TransactionHistory = await response.json();
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
      const response = await fetch(`${this.apiUrl}/transactions/${txHash}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete transaction: ${response.status}`);
      }

      console.log('✅ Transaction deleted:', txHash);
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
      const response = await fetch(`${this.apiUrl}/transactions/clear/${address}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to clear history: ${response.status}`);
      }

      console.log('✅ Transaction history cleared for:', address);
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

      const response = await fetch(`${this.apiUrl}/transactions/stats?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch transaction stats: ${response.status}`);
      }

      return await response.json();
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
