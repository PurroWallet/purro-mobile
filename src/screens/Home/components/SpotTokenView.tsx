/**
 * SpotTokenView Component
 * Displays Hyperliquid Spot tokens with balances and total
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/Icon';
import type { FormattedSpotToken } from '@/core/apis/hyperliquid';
import SpotTokenItem from './SpotTokenItem';

interface SpotTokenViewProps {
  tokens: FormattedSpotToken[];
  totalBalance: string;
  totalTokensCount: number;
  isLoading: boolean;
  error: string | null;
  onRefresh?: () => Promise<void>;
  onAddToken?: () => void;
}

const SpotTokenView: React.FC<SpotTokenViewProps> = ({
  tokens,
  totalBalance,
  totalTokensCount,
  isLoading,
  error,
  onAddToken,
}) => {
  const { t } = useTranslation();

  if (isLoading && tokens.length === 0) {
    return (
      <View className="items-center justify-center py-20">
        <ActivityIndicator size="large" />
        <Text className="text-text-secondary text-sm mt-4">
          {t('home.loading', { defaultValue: 'Loading...' })}
        </Text>
      </View>
    );
  }

  if (error && tokens.length === 0) {
    return (
      <View className="items-center justify-center py-20">
        <Text className="text-system-error text-base mb-2">
          {t('home.spot.error', { defaultValue: 'Failed to load spot tokens' })}
        </Text>
        <Text className="text-text-secondary text-sm">{error}</Text>
      </View>
    );
  }

  return (
    <>
      {/* Balance Summary Cards */}
      <View className="flex-row gap-2 mb-2">
        <View className="flex-1 rounded-xl bg-background-secondary/60 p-5">
          <Text className="text-text-secondary text-base mb-3.5">{t('home.totalBalance')}</Text>
          <Text className="text-text-primary text-2xl font-medium">
            {isLoading ? '...' : totalBalance}
          </Text>
        </View>
        <View className="flex-1 rounded-xl bg-background-secondary/60 p-5">
          <Text className="text-text-secondary text-base mb-3.5">{t('home.totalTokens')}</Text>
          <Text className="text-text-primary text-2xl font-medium">{totalTokensCount}</Text>
        </View>
      </View>

      {/* Token List */}
      {tokens.length === 0 ? (
        <View className="rounded-xl bg-background-secondary/60 p-8 items-center">
          <View className="w-16 h-16 rounded-full bg-background-tertiary items-center justify-center mb-3">
            <Icon name="coins" size={32} color="#6B7280" />
          </View>
          <Text className="text-base font-semibold text-text-primary mb-1">
            {t('home.spot.noTokensTitle', { defaultValue: 'No Spot Tokens' })}
          </Text>
          <Text className="text-sm text-text-secondary text-center">
            {t('home.spot.noTokens', {
              defaultValue: 'Your spot tokens will appear here',
            })}
          </Text>
        </View>
      ) : (
        <>
          {tokens.map((token) => (
            <SpotTokenItem key={token.id} token={token} />
          ))}
        </>
      )}

      {/* Add Token Button */}
      <TouchableOpacity
        className="rounded-xl bg-background-secondary px-4 py-6 flex-row items-center justify-center gap-2"
        onPress={onAddToken}
      >
        <Icon name="plus" size={16} />
        <Text className="text-text-primary text-base text-right">{t('home.addTestnetToken')}</Text>
      </TouchableOpacity>
    </>
  );
};

export default SpotTokenView;
