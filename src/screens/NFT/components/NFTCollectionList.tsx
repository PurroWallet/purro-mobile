import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NFTCollection } from '@/core/apis/hyperscan/types';
import NFTCollectionItem from './NFTCollectionItem';

interface NFTCollectionListProps {
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
  /** Collection item press handler */
  onCollectionPress?: (collection: NFTCollection) => void;
  /** Whether data is stale (showing cached data) */
  isStale?: boolean;
}

/**
 * NFTCollectionList Component
 * Displays NFT collections in a 2-column grid with infinite scroll and pull-to-refresh
 */
const NFTCollectionList: React.FC<NFTCollectionListProps> = ({
  collections,
  isLoading,
  error,
  hasNextPage,
  onLoadMore,
  onRefresh,
  onCollectionPress,
  isStale = false,
}) => {
  const { t } = useTranslation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  }, [onRefresh]);

  // Handle load more
  const handleLoadMore = useCallback(async () => {
    if (hasNextPage && !isLoadingMore && !isLoading) {
      setIsLoadingMore(true);
      await onLoadMore();
      setIsLoadingMore(false);
    }
  }, [hasNextPage, isLoadingMore, isLoading, onLoadMore]);

  // Render loading skeleton for initial load
  const renderLoadingSkeleton = () => (
    <View className="flex-1 px-4">
      <View className="flex-row flex-wrap gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <View
            key={i}
            className="rounded-xl bg-background-secondary overflow-hidden"
            style={{ width: '48%' }}
          >
            <View className="w-full aspect-square bg-background-tertiary" />
            <View className="p-3">
              <View className="h-5 w-3/4 bg-background-tertiary rounded mb-2" />
              <View className="h-4 w-1/2 bg-background-tertiary rounded" />
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20 px-4">
      <Text className="text-text-secondary text-base text-center">
        {t('nft.noCollections', { defaultValue: 'No NFT collections found' })}
      </Text>
    </View>
  );

  // Render error state
  const renderErrorState = () => (
    <View className="flex-1 items-center justify-center py-20 px-4">
      <Text className="text-system-error text-base mb-4 text-center">
        {error?.message ||
          t('nft.errorLoadingCollections', { defaultValue: 'Error loading NFT collections' })}
      </Text>
      <TouchableOpacity className="bg-brand-primary px-6 py-3 rounded-lg" onPress={onRefresh}>
        <Text className="text-white font-medium">{t('nft.retry', { defaultValue: 'Retry' })}</Text>
      </TouchableOpacity>
    </View>
  );

  // Render footer loading indicator
  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" />
      </View>
    );
  };

  // Render collection item
  const renderItem = ({ item }: { item: NFTCollection }) => (
    <NFTCollectionItem collection={item} onPress={() => onCollectionPress?.(item)} />
  );

  // Show loading skeleton on initial load
  if (isLoading && collections.length === 0) {
    return renderLoadingSkeleton();
  }

  // Show error state
  if (!isLoading && error) {
    return renderErrorState();
  }

  // Show empty state
  if (!isLoading && collections.length === 0) {
    return renderEmptyState();
  }

  // Render stale data header
  const renderStaleHeader = () => {
    if (!isStale || isLoading) return null;
    return (
      <View className="mx-4 mb-3 px-3 py-2 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
        <Text className="text-xs text-yellow-600">
          {t('nft.staleDataWarning', {
            defaultValue: 'Showing cached data. Pull to refresh for latest.',
          })}
        </Text>
      </View>
    );
  };

  // Show collection list
  return (
    <FlatList
      data={collections}
      renderItem={renderItem}
      keyExtractor={(item, index) => `${item.token.address}-${index}`}
      numColumns={2}
      columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
      contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListHeaderComponent={renderStaleHeader}
      ListFooterComponent={renderFooter}
    />
  );
};

export default NFTCollectionList;
