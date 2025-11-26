import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/Icon';
import type { ChainTokenData } from '@/core/apis/alchemy/types';
import TokenItem from './TokenItem';

interface TokenListProps {
  /** Token data for all chains */
  tokens: ChainTokenData[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Refetch callback */
  onRefresh: () => Promise<void>;
  /** Token item press handler */
  onTokenPress?: (token: ChainTokenData['tokens'][0], chain: ChainTokenData['chain']) => void;
  /** Send token handler */
  onSendToken?: (token: ChainTokenData['tokens'][0], chain: ChainTokenData['chain']) => void;
  /** Swap token handler */
  onSwapToken?: (token: ChainTokenData['tokens'][0], chain: ChainTokenData['chain']) => void;
  /** Whether data is stale (showing cached data) */
  isStale?: boolean;
}

type ChainTab = 'all' | 'ethereum' | 'base' | 'arbitrum';

/**
 * TokenList Component
 * Displays EVM tokens across multiple chains with chain selector tabs
 */
const TokenList: React.FC<TokenListProps> = ({
  tokens,
  isLoading,
  error,
  onRefresh,
  onTokenPress,
  onSendToken,
  onSwapToken,
  isStale = false,
}) => {
  const { t } = useTranslation();
  const [selectedChain, setSelectedChain] = useState<ChainTab>('all');

  // Filter tokens based on selected chain
  const filteredTokens = useMemo(() => {
    if (selectedChain === 'all') {
      return tokens;
    }
    return tokens.filter((chainData) => chainData.chain === selectedChain);
  }, [tokens, selectedChain]);

  // Calculate total token count
  const totalTokenCount = useMemo(() => {
    return filteredTokens.reduce((sum, chainData) => sum + chainData.tokens.length, 0);
  }, [filteredTokens]);

  // Chain tab configuration
  const chainTabs: Array<{ key: ChainTab; label: string }> = [
    { key: 'all', label: t('home.chains.all', { defaultValue: 'All' }) },
    { key: 'ethereum', label: t('home.chains.ethereum', { defaultValue: 'Ethereum' }) },
    { key: 'base', label: t('home.chains.base', { defaultValue: 'Base' }) },
    { key: 'arbitrum', label: t('home.chains.arbitrum', { defaultValue: 'Arbitrum' }) },
  ];

  // Render loading skeleton for a chain
  const renderChainSkeleton = (chain: string) => (
    <View key={`skeleton-${chain}`} className="mb-4">
      <Text className="text-text-secondary text-sm mb-2 capitalize">{chain}</Text>
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          className="rounded-xl bg-background-secondary px-4 py-5 flex-row items-center gap-5 mb-2"
        >
          <View className="w-12 h-12 rounded-full bg-background-tertiary" />
          <View className="flex-1">
            <View className="h-5 w-24 bg-background-tertiary rounded mb-2" />
            <View className="h-4 w-16 bg-background-tertiary rounded" />
          </View>
          <View className="h-5 w-20 bg-background-tertiary rounded" />
        </View>
      ))}
    </View>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View className="items-center justify-center py-20 px-4">
      <View className="w-24 h-24 rounded-full bg-background-secondary items-center justify-center mb-4">
        <Icon name="coins" size={48} color="#6B7280" />
      </View>
      <Text className="text-lg font-semibold text-text-primary mb-2">
        {t('home.noTokensTitle', { defaultValue: 'No Tokens Yet' })}
      </Text>
      <Text className="text-sm text-text-secondary text-center">
        {t('home.noTokens', { defaultValue: 'Your tokens will appear here once you receive them' })}
      </Text>
    </View>
  );

  // Render error state
  const renderErrorState = () => (
    <View className="items-center justify-center py-20">
      <Text className="text-system-error text-base mb-4">
        {error?.message || t('home.errorLoadingTokens', { defaultValue: 'Error loading tokens' })}
      </Text>
      <TouchableOpacity className="bg-brand-primary px-6 py-3 rounded-lg" onPress={onRefresh}>
        <Text className="text-white font-medium">{t('home.retry', { defaultValue: 'Retry' })}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1">
      {/* Stale Data Indicator */}
      {isStale && !isLoading && (
        <View className="mb-3 px-3 py-2 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
          <Text className="text-xs text-yellow-600">
            {t('home.staleDataWarning', {
              defaultValue: 'Showing cached data. Pull to refresh for latest.',
            })}
          </Text>
        </View>
      )}

      {/* Chain Selector Tabs */}
      <View className="mb-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {chainTabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              className={`px-4 py-2 rounded-full ${
                selectedChain === tab.key
                  ? 'bg-brand-primary'
                  : 'bg-background-secondary border border-border-secondary'
              }`}
              onPress={() => setSelectedChain(tab.key)}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedChain === tab.key ? 'text-white' : 'text-text-secondary'
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Token List Content */}
      <View className="flex-1">
        {/* Loading State */}
        {isLoading && (
          <View>
            {selectedChain === 'all'
              ? ['ethereum', 'base', 'arbitrum'].map(renderChainSkeleton)
              : renderChainSkeleton(selectedChain)}
          </View>
        )}

        {/* Error State */}
        {!isLoading && error && renderErrorState()}

        {/* Empty State */}
        {!isLoading && !error && totalTokenCount === 0 && renderEmptyState()}

        {/* Token List Content */}
        {!isLoading && !error && totalTokenCount > 0 && (
          <View className="pb-4">
            {filteredTokens.map((chainData) => (
              <View key={chainData.chain} className="mb-4">
                {/* Chain Header (only show if 'all' is selected) */}
                {selectedChain === 'all' && (
                  <Text className="text-text-secondary text-sm mb-2 capitalize">
                    {chainData.chain}
                  </Text>
                )}

                {/* Chain Loading State */}
                {chainData.isLoading && (
                  <View className="items-center py-4">
                    <ActivityIndicator size="small" />
                  </View>
                )}

                {/* Chain Error State */}
                {chainData.error && (
                  <View className="rounded-xl bg-background-secondary px-4 py-4 mb-2">
                    <Text className="text-system-error text-sm">{chainData.error}</Text>
                  </View>
                )}

                {/* Chain Tokens */}
                {!chainData.isLoading &&
                  !chainData.error &&
                  chainData.tokens.map((token) => (
                    <TokenItem
                      key={`${chainData.chain}-${token.contractAddress}`}
                      token={token}
                      chain={chainData.chain}
                      onPress={() => onTokenPress?.(token, chainData.chain)}
                      onSend={() => onSendToken?.(token, chainData.chain)}
                      onSwap={() => onSwapToken?.(token, chainData.chain)}
                    />
                  ))}
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default TokenList;
