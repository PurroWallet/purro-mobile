/**
 * useTransactions Hook
 * Manages transaction history fetching with pagination and date grouping
 */

import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { hyperscanService } from '@/core/apis/hyperscan/hyperscanService';
import type {
  NextPageParams,
  TokenTransfer,
  TokenTransferGroup,
  Transaction,
  TransactionFilter,
} from '@/core/apis/hyperscan/types';

const TRANSACTIONS_QUERY_KEY_PREFIX = 'wallet_transactions';

/**
 * Generate query key for transactions
 */
function getTransactionsQueryKey(
  address: string,
  filter: TransactionFilter,
  isTestnet: boolean = false,
): string[] {
  return [TRANSACTIONS_QUERY_KEY_PREFIX, address, filter, isTestnet ? 'testnet' : 'mainnet'];
}

/**
 * Fetch transactions with pagination
 */
async function fetchTransactionsPage(
  address: string,
  filter: TransactionFilter,
  isTestnet: boolean,
  pageParam?: NextPageParams,
) {
  console.log('🔍 useTransactions - Fetching transactions for address:', address);
  hyperscanService.setTestnetMode(isTestnet);
  const response = await hyperscanService.fetchTokenTransfers(address, filter, pageParam);

  console.log(`✅ useTransactions - Fetched ${response.items.length} transactions`);

  return response;
}

/**
 * Group transactions by date
 */
function groupTransactionsByDate(transactions: TokenTransfer[]): TokenTransferGroup[] {
  const groups = new Map<string, TokenTransfer[]>();

  transactions.forEach((tx) => {
    const date = new Date(tx.timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let dateKey: string;

    if (date.toDateString() === today.toDateString()) {
      dateKey = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = 'Yesterday';
    } else {
      dateKey = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }

    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(tx);
  });

  // Convert to array and sort by date (most recent first)
  return Array.from(groups.entries()).map(([date, transactions]) => ({
    date,
    transactions,
  }));
}

/**
 * Hook return type
 */
export interface UseTransactionsReturn {
  /** Grouped transactions by date */
  transactionGroups: TokenTransferGroup[];
  /** Flat list of all transactions */
  transactions: TokenTransfer[];
  /** Loading state for initial fetch */
  isLoading: boolean;
  /** Loading state for fetching next page */
  isFetchingNextPage: boolean;
  /** Error state */
  error: Error | null;
  /** Whether there are more pages to fetch */
  hasNextPage: boolean;
  /** Fetch next page of transactions */
  fetchNextPage: () => Promise<void>;
  /** Refetch transactions from beginning */
  refetch: () => Promise<void>;
}

/**
 * useTransactions Hook
 * Fetches and manages transaction history with pagination and date grouping
 *
 * @param address - Wallet address to fetch transactions for
 * @param filter - Transaction filter ('from', 'to', or 'both')
 * @param isTestnet - Whether to use testnet endpoints (default: false)
 * @returns Transaction data, loading states, error state, and utility functions
 */
export function useTransactions(
  address: string,
  filter: TransactionFilter = 'both',
  isTestnet: boolean = false,
): UseTransactionsReturn {
  const queryClient = useQueryClient();
  const queryKey = getTransactionsQueryKey(address, filter, isTestnet);

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchTransactionsPage(address, filter, isTestnet, pageParam),
    enabled: !!address && address.length > 0,
    initialPageParam: undefined as NextPageParams | undefined,
    getNextPageParam: (lastPage) => lastPage.next_page_params ?? undefined,
    staleTime: 10000,
    gcTime: 60000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
  });

  /**
   * Flatten all pages into single transaction array
   */
  const transactions = useMemo(() => {
    if (!query.data?.pages) return [];
    return query.data.pages.flatMap((page) => page.items);
  }, [query.data?.pages]);

  /**
   * Group transactions by date
   */
  const transactionGroups = useMemo(() => {
    return groupTransactionsByDate(transactions);
  }, [transactions]);

  /**
   * Fetch next page of transactions
   */
  const fetchNextPage = useCallback(async () => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      console.log('📄 useTransactions - Fetching next page');
      await query.fetchNextPage();
    }
  }, [query]);

  /**
   * Refetch transactions from beginning
   */
  const refetch = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  return {
    transactionGroups,
    transactions,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    error: query.error instanceof Error ? query.error : null,
    hasNextPage: query.hasNextPage ?? false,
    fetchNextPage,
    refetch,
  };
}

/**
 * Hook return type for transaction details
 */
export interface UseTransactionDetailsReturn {
  /** Transaction details */
  transaction: Transaction | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Refetch transaction details */
  refetch: () => Promise<void>;
}

/**
 * useTransactionDetails Hook
 * Fetches detailed information for a single transaction
 *
 * @param txHash - Transaction hash to fetch details for
 * @param isTestnet - Whether to use testnet endpoints (default: false)
 * @returns Transaction details, loading state, error state, and refetch function
 * );
 * ```
 */
export function useTransactionDetails(
  txHash: string,
  isTestnet: boolean = false,
): UseTransactionDetailsReturn {
  const queryClient = useQueryClient();
  const queryKey = ['transaction_details', txHash, isTestnet ? 'testnet' : 'mainnet'];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      hyperscanService.setTestnetMode(isTestnet);
      const transaction = await hyperscanService.fetchTransactionDetails(txHash);

      console.log('✅ useTransactionDetails - Fetched transaction details');
      return transaction;
    },
    enabled: !!txHash && txHash.length > 0,
    staleTime: 60000, // 1 minute - transaction details don't change once confirmed
    gcTime: 300000, // 5 minutes - keep in cache for quick access
    retry: 2, // Retry failed requests twice
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
  });

  /**
   * Refetch transaction details
   */
  const refetch = useCallback(async () => {
    console.log('🔄 useTransactionDetails - Refetching transaction details');
    await queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  return {
    transaction: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error : null,
    refetch,
  };
}
