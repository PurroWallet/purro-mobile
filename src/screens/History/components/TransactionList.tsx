import { Filter } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import type { ListRenderItem } from 'react-native';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type {
  TokenTransfer,
  TokenTransferGroup,
  TransactionFilter,
} from '@/core/apis/hyperscan/types';
import { useCurrentAccount } from '@/core/hooks/wallet/useCurrentAccount';
import { useTransactions } from '@/core/hooks/wallet/useTransactions';
import TransactionGroup from './TransactionGroup';

interface TransactionListProps {
  onTransactionPress?: (transaction: TokenTransfer) => void;
}

/**
 * TransactionList Component
 * Displays transaction history with filtering, pagination, and pull-to-refresh
 *
 * @param onTransactionPress - Callback when a transaction is tapped
 */
const TransactionList: React.FC<TransactionListProps> = ({ onTransactionPress }) => {
  const { currentAccount } = useCurrentAccount();
  const [filter, setFilter] = useState<TransactionFilter>('both');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const {
    transactionGroups,
    isLoading,
    isFetchingNextPage,
    error,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useTransactions(currentAccount?.address || '', filter, false);

  // Handle filter change
  const handleFilterChange = useCallback((newFilter: TransactionFilter) => {
    setFilter(newFilter);
    setShowFilterMenu(false);
  }, []);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Render transaction group
  const renderGroup: ListRenderItem<TokenTransferGroup> = useCallback(
    ({ item }) => (
      <TransactionGroup
        date={item.date}
        transactions={item.transactions}
        onTransactionPress={onTransactionPress}
      />
    ),
    [onTransactionPress],
  );

  // Render loading footer
  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#059288" />
      </View>
    );
  }, [isFetchingNextPage]);

  // Render empty state
  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <View className="flex-1 items-center justify-center py-20">
        <Text className="text-lg text-text-secondary">No transactions found</Text>
        <Text className="text-sm text-text-secondary mt-2">
          Your transaction history will appear here
        </Text>
      </View>
    );
  }, [isLoading]);

  // Render error state
  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-lg text-system-error mb-2">Failed to load transactions</Text>
        <Text className="text-sm text-text-secondary mb-4 text-center">{error.message}</Text>
        <TouchableOpacity
          onPress={handleRefresh}
          className="px-6 py-3 bg-accent rounded-lg"
          activeOpacity={0.7}
        >
          <Text className="text-base font-medium text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render loading state
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#059288" />
        <Text className="text-sm text-text-secondary mt-4">Loading transactions...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Filter Button */}
      <View className="px-4 py-2 flex-row justify-end">
        <TouchableOpacity
          onPress={() => setShowFilterMenu(!showFilterMenu)}
          className="flex-row items-center px-3 py-2 bg-background-secondary rounded-lg"
          activeOpacity={0.7}
        >
          <Filter size={16} color="#059288" />
          <Text className="text-sm text-text-primary ml-2 capitalize">{filter}</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Menu */}
      {showFilterMenu && (
        <View className="px-4 pb-2">
          <View className="bg-background-secondary rounded-lg overflow-hidden">
            <TouchableOpacity
              onPress={() => handleFilterChange('both')}
              className={`px-4 py-3 ${filter === 'both' ? 'bg-accent/10' : ''}`}
              activeOpacity={0.7}
            >
              <Text
                className={`text-base ${filter === 'both' ? 'text-accent font-medium' : 'text-text-primary'}`}
              >
                All Transactions
              </Text>
            </TouchableOpacity>
            <View className="h-px bg-border-secondary" />
            <TouchableOpacity
              onPress={() => handleFilterChange('from')}
              className={`px-4 py-3 ${filter === 'from' ? 'bg-accent/10' : ''}`}
              activeOpacity={0.7}
            >
              <Text
                className={`text-base ${filter === 'from' ? 'text-accent font-medium' : 'text-text-primary'}`}
              >
                Sent Only
              </Text>
            </TouchableOpacity>
            <View className="h-px bg-border-secondary" />
            <TouchableOpacity
              onPress={() => handleFilterChange('to')}
              className={`px-4 py-3 ${filter === 'to' ? 'bg-accent/10' : ''}`}
              activeOpacity={0.7}
            >
              <Text
                className={`text-base ${filter === 'to' ? 'text-accent font-medium' : 'text-text-primary'}`}
              >
                Received Only
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Transaction List */}
      <FlatList<TokenTransferGroup>
        data={transactionGroups}
        renderItem={renderGroup}
        keyExtractor={(item) => item.date}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor="#059288"
            colors={['#059288']}
          />
        }
        className="flex-1"
      />
    </View>
  );
};

export default TransactionList;
