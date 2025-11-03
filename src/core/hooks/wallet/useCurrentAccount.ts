import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { walletController } from '@/core/controllers/WalletController';

export interface WalletAccount {
  address: string;
  type?: string;
  brandName?: string;
  alianName?: string;
}

const CURRENT_ACCOUNT_QUERY_KEY = ['wallet', 'currentAccount'];

async function fetchCurrentAccount(): Promise<WalletAccount | null> {
  try {
    console.log('🔍 useCurrentAccount - Fetching current account');
    const account = await walletController.getCurrentAccount();
    if (account?.address) {
      return account;
    }

    const allAccounts = await walletController.getAllAccounts();
    if (allAccounts.length > 0) {
      const fallback = allAccounts[0];
      walletController.setCurrentAccount(fallback.address);
      return fallback;
    }

    return null;
  } catch (error) {
    console.error('❌ useCurrentAccount - Failed to fetch account', error);
    throw error instanceof Error ? error : new Error('Failed to fetch current account');
  }
}

export function useCurrentAccount() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: CURRENT_ACCOUNT_QUERY_KEY,
    queryFn: fetchCurrentAccount,
    staleTime: 0,
  });

  const setCurrentAccount = useCallback(
    (account: WalletAccount | null) => {
      if (account?.address) {
        walletController.setCurrentAccount(account.address);
      }
      queryClient.setQueryData(CURRENT_ACCOUNT_QUERY_KEY, account);
    },
    [queryClient],
  );

  const refetchCurrentAccount = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: CURRENT_ACCOUNT_QUERY_KEY });
  }, [queryClient]);

  return {
    currentAccount: query.data ?? null,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error : null,
    refetchCurrentAccount,
    setCurrentAccount,
  };
}
