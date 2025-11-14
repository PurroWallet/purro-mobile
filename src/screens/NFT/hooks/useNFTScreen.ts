/**
 * useNFTScreen Hook
 * Manages NFT screen state and logic
 */

import { useCallback, useRef } from 'react';
import type { NFTCollection } from '@/core/apis/hyperscan/types';
import { useCurrentAccount, useNFTs } from '@/core/hooks/wallet';
import type { NFTInstanceDialogRef } from '../components/NFTInstanceDialog';

/**
 * Hook return type
 */
export interface UseNFTScreenReturn {
  /** NFT collections */
  collections: NFTCollection[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Whether there are more pages to fetch */
  hasNextPage: boolean;
  /** Fetch next page callback */
  onLoadMore: () => Promise<void>;
  /** Refetch callback */
  onRefresh: () => Promise<void>;
  /** Collection press handler */
  onCollectionPress: (collection: NFTCollection) => void;
  /** Current account address */
  currentAddress: string;
  /** NFT instance dialog ref */
  nftInstanceDialogRef: React.RefObject<NFTInstanceDialogRef | null>;
}

/**
 * useNFTScreen Hook
 * Provides state and handlers for the NFT screen
 *
 * @param isTestnet - Whether to use testnet endpoints (default: false)
 * @returns NFT screen state and handlers
 */
export function useNFTScreen(isTestnet: boolean = false): UseNFTScreenReturn {
  const nftInstanceDialogRef = useRef<NFTInstanceDialogRef | null>(null);

  // Get current account
  const { currentAccount } = useCurrentAccount();
  const currentAddress = currentAccount?.address || '';

  // Fetch NFT collections
  const { collections, isLoading, error, hasNextPage, fetchNextPage, refetch } = useNFTs(
    currentAddress,
    isTestnet,
  );

  /**
   * Handle collection press
   * Opens the NFT instance dialog
   */
  const handleCollectionPress = useCallback((collection: NFTCollection) => {
    console.log('📱 NFT Screen - Collection pressed:', collection.token.name);
    nftInstanceDialogRef.current?.present(collection);
  }, []);

  /**
   * Handle load more
   */
  const handleLoadMore = useCallback(async () => {
    console.log('📱 NFT Screen - Loading more collections');
    await fetchNextPage();
  }, [fetchNextPage]);

  /**
   * Handle refresh
   */
  const handleRefresh = useCallback(async () => {
    console.log('📱 NFT Screen - Refreshing collections');
    await refetch();
  }, [refetch]);

  return {
    collections,
    isLoading,
    error,
    hasNextPage,
    onLoadMore: handleLoadMore,
    onRefresh: handleRefresh,
    onCollectionPress: handleCollectionPress,
    currentAddress,
    nftInstanceDialogRef,
  };
}
