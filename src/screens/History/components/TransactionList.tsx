import { Filter } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import type { ListRenderItem } from 'react-native';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CHAIN_NAMES, type SupportedChainId } from '@/core/apis/etherscan';
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
  const [selectedChain, setSelectedChain] = useState<SupportedChainId | 'all'>('all');

  const {
    transactionGroups: allTransactionGroups,
    isLoading,
    isFetchingNextPage,
    error,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useTransactions(currentAccount?.address || '', filter, false, 'etherscan');

  // Filter transactions by selected chain
  const transactionGroups = useMemo(() => {
    if (selectedChain === 'all') {
      return allTransactionGroups;
    }

    // Filter groups by chain
    return allTransactionGroups
      .map((group) => ({
        ...group,
        transactions: group.transactions.filter((tx) => {
          // Determine chain from token name or symbol
          const chainName = CHAIN_NAMES[selectedChain];
          return (
            tx.token.name.includes(chainName) || tx.token.symbol.includes(chainName.toUpperCase())
          );
        }),
      }))
      .filter((group) => group.transactions.length > 0);
  }, [allTransactionGroups, selectedChain]);

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

  const renderEmpty = useCallback(() => {
    if (isLoading) return null;
    return (
      <View className="flex-1 items-center justify-center py-20 px-4">
        <View className="w-24 h-24 rounded-full bg-background-secondary items-center justify-center mb-4">
          <Filter size={48} color="#6B7280" />
        </View>
        <Text className="text-lg font-semibold text-text-primary mb-2">No transactions found</Text>
        <Text className="text-sm text-text-secondary text-center">
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

  // Render skeleton loading state
  const renderSkeleton = useCallback(() => {
    return (
      <View className="flex-1 px-4">
        {[1, 2, 3].map((groupIndex) => (
          <View key={groupIndex} className="mb-6">
            {/* Date skeleton */}
            <View className="h-4 w-24 bg-background-secondary rounded mb-3" />

            {/* Transaction items skeleton */}
            {[1, 2, 3].map((itemIndex) => (
              <View
                key={itemIndex}
                className="flex-row items-center justify-between py-4 border-b border-border-secondary"
              >
                {/* Left side: Icon + Info */}
                <View className="flex-row items-center flex-1">
                  {/* Icon skeleton */}
                  <View className="w-12 h-12 rounded-full bg-background-secondary mr-4" />

                  {/* Text info skeleton */}
                  <View className="flex-1">
                    <View className="h-4 w-32 bg-background-secondary rounded mb-2" />
                    <View className="h-3 w-24 bg-background-secondary rounded" />
                  </View>
                </View>

                {/* Right side: Amount skeleton */}
                <View className="items-end">
                  <View className="h-4 w-20 bg-background-secondary rounded mb-2" />
                  <View className="h-3 w-16 bg-background-secondary rounded" />
                </View>
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  }, []);

  // Render loading state
  if (isLoading) {
    return (
      <View className="flex-1">
        {/* Chain Filter Tabs Skeleton */}
        <View className="px-4 py-2">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <View key={i} className="h-9 w-24 bg-background-secondary rounded-lg" />
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Transaction List Skeleton */}
        <ScrollView className="flex-1">{renderSkeleton()}</ScrollView>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Chain Filter Tabs */}
      <View className="px-4 py-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setSelectedChain('all')}
              className={`px-4 py-2 rounded-lg ${
                selectedChain === 'all' ? 'bg-accent' : 'bg-background-secondary'
              }`}
              activeOpacity={0.7}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedChain === 'all' ? 'text-white' : 'text-text-primary'
                }`}
              >
                All Chains
              </Text>
            </TouchableOpacity>
            {([1, 42161, 8453, 999] as SupportedChainId[]).map((chainId) => (
              <TouchableOpacity
                key={chainId}
                onPress={() => setSelectedChain(chainId)}
                className={`px-4 py-2 rounded-lg ${
                  selectedChain === chainId ? 'bg-accent' : 'bg-background-secondary'
                }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-sm font-medium ${
                    selectedChain === chainId ? 'text-white' : 'text-text-primary'
                  }`}
                >
                  {CHAIN_NAMES[chainId]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

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
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1"
      />
    </View>
  );
};

export default TransactionList;
