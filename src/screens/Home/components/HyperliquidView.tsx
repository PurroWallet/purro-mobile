/**
 * HyperliquidView Component
 * Displays Hyperliquid account information including metrics and positions
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/Icon';
import type { AccountMetrics, FormattedPosition } from '@/core/apis/hyperliquid';

interface HyperliquidViewProps {
  accountMetrics: AccountMetrics | null;
  positions: FormattedPosition[];
  isLoading: boolean;
  error: string | null;
  onTransfer?: () => void;
}

const HyperliquidView: React.FC<HyperliquidViewProps> = ({
  accountMetrics,
  positions,
  isLoading,
  error,
  onTransfer,
}) => {
  const { t } = useTranslation();

  if (isLoading && !accountMetrics) {
    return (
      <View className="items-center justify-center py-20">
        <ActivityIndicator size="large" />
        <Text className="text-text-secondary text-sm mt-4">
          {t('home.loading', { defaultValue: 'Loading...' })}
        </Text>
      </View>
    );
  }

  if (error && !accountMetrics) {
    return (
      <View className="items-center justify-center py-20">
        <Text className="text-system-error text-base mb-2">
          {t('home.hyperliquid.error', { defaultValue: 'Failed to load data' })}
        </Text>
        <Text className="text-text-secondary text-sm">{error}</Text>
      </View>
    );
  }

  const metrics = accountMetrics || {
    accountValue: '$0.00',
    marginUsed: '$0.00',
    totalPosition: '$0.00',
    withdrawable: '$0.00',
  };

  return (
    <View>
      {/* Account Metrics Grid */}
      <View className="flex-row flex-wrap gap-2 mb-4">
        {/* Account Value Card */}
        <View className="flex-1 min-w-[48%] rounded-xl bg-background-secondary/60 p-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-text-secondary text-base">
              {t('home.hyperliquid.accountValue', { defaultValue: 'Account Value' })}
            </Text>
            {onTransfer && (
              <TouchableOpacity onPress={onTransfer}>
                <Text className="text-brand-primary text-sm font-medium">
                  {t('home.hyperliquid.transfer', { defaultValue: 'Transfer' })}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <Text className="text-text-primary text-2xl font-medium">{metrics.accountValue}</Text>
        </View>

        {/* Margin Used Card */}
        <View className="flex-1 min-w-[48%] rounded-xl bg-background-secondary/60 p-5">
          <Text className="text-text-secondary text-base mb-3">
            {t('home.hyperliquid.marginUsed', { defaultValue: 'Margin Used' })}
          </Text>
          <Text className="text-text-primary text-2xl font-medium">{metrics.marginUsed}</Text>
        </View>

        {/* Total Position Card */}
        <View className="flex-1 min-w-[48%] rounded-xl bg-background-secondary/60 p-5">
          <Text className="text-text-secondary text-base mb-3">
            {t('home.hyperliquid.totalPosition', { defaultValue: 'Total Position' })}
          </Text>
          <Text className="text-text-primary text-2xl font-medium">{metrics.totalPosition}</Text>
        </View>

        {/* Withdrawable Card */}
        <View className="flex-1 min-w-[48%] rounded-xl bg-background-secondary/60 p-5">
          <Text className="text-text-secondary text-base mb-3">
            {t('home.hyperliquid.withdrawable', { defaultValue: 'Withdrawable' })}
          </Text>
          <Text className="text-text-primary text-2xl font-medium">{metrics.withdrawable}</Text>
        </View>
      </View>

      {/* Positions Section */}
      <View>
        {positions.length === 0 ? (
          <View className="rounded-xl bg-background-secondary/60 p-8 items-center">
            <View className="w-16 h-16 rounded-full bg-background-tertiary items-center justify-center mb-3">
              <Icon name="trending-up" size={32} color="#6B7280" />
            </View>
            <Text className="text-base font-semibold text-text-primary mb-1">
              {t('home.hyperliquid.noPositionsTitle', { defaultValue: 'No Open Positions' })}
            </Text>
            <Text className="text-sm text-text-secondary text-center">
              {t('home.hyperliquid.noPositions', {
                defaultValue: 'Your trading positions will appear here',
              })}
            </Text>
          </View>
        ) : (
          <>
            <Text className="text-text-primary text-lg font-semibold mb-3">
              {t('home.hyperliquid.openPositions', { defaultValue: 'Open Positions' })}
            </Text>
            {positions.map((position) => (
              <View key={position.id} className="rounded-xl bg-background-secondary px-4 py-4 mb-2">
                <View className="flex-row justify-between items-start mb-3">
                  <View>
                    <Text className="text-text-primary text-xl font-medium mb-1">
                      {position.coin}
                    </Text>
                    <Text className="text-text-secondary text-sm">
                      {position.leverage}x{' '}
                      {t('home.hyperliquid.leverage', { defaultValue: 'Leverage' })}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-text-primary text-lg font-medium mb-1">
                      {position.positionValue}
                    </Text>
                    <Text
                      className={`text-sm font-medium ${
                        position.isPositive ? 'text-system-success' : 'text-system-error'
                      }`}
                    >
                      {position.unrealizedPnl}
                    </Text>
                  </View>
                </View>
                <View className="flex-row justify-between">
                  <View>
                    <Text className="text-text-secondary text-xs mb-1">
                      {t('home.hyperliquid.size', { defaultValue: 'Size' })}
                    </Text>
                    <Text className="text-text-primary text-sm">{position.size}</Text>
                  </View>
                  <View>
                    <Text className="text-text-secondary text-xs mb-1">
                      {t('home.hyperliquid.entryPrice', { defaultValue: 'Entry Price' })}
                    </Text>
                    <Text className="text-text-primary text-sm">{position.entryPrice}</Text>
                  </View>
                  <View>
                    <Text className="text-text-secondary text-xs mb-1">
                      {t('home.hyperliquid.margin', { defaultValue: 'Margin' })}
                    </Text>
                    <Text className="text-text-primary text-sm">{position.marginUsed}</Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
      </View>
    </View>
  );
};

export default HyperliquidView;
