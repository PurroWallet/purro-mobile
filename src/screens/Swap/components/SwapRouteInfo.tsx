import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/Icon';
import type { SwapRoute } from '@/core/apis/liquidswap/types';
import { useThemeMode } from '@/core/hooks/useTheme';

interface SwapRouteInfoProps {
  /** Swap route data */
  route: SwapRoute | null;
  /** Loading state for route finding */
  isLoading: boolean;
  /** Error message if route finding failed */
  error: string | null;
  /** Retry callback for failed route finding */
  onRetry?: () => void;
}

/**
 * SwapRouteInfo Component
 * Displays swap route details including exchange rate, price impact, and route path
 */
export const SwapRouteInfo: React.FC<SwapRouteInfoProps> = ({
  route,
  isLoading,
  error,
  onRetry,
}) => {
  const { t } = useTranslation();
  const { themeMode } = useThemeMode();
  const isDarkMode = themeMode === 'dark';

  /**
   * Format large numbers with appropriate decimals
   */
  const formatAmount = (amount: string, decimals: number = 6): string => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '0';

    // For very small numbers, use more decimals
    if (num < 0.000001) {
      return num.toExponential(2);
    }

    // For small numbers, show more decimals
    if (num < 1) {
      return num.toFixed(decimals);
    }

    // For larger numbers, show fewer decimals
    if (num > 1000) {
      return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }

    return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
  };

  /**
   * Calculate exchange rate from route
   */
  const getExchangeRate = (): string | null => {
    if (!route) return null;

    const amountIn = parseFloat(route.amountIn);
    const amountOut = parseFloat(route.amountOut);

    if (isNaN(amountIn) || isNaN(amountOut) || amountIn === 0) {
      return null;
    }

    const rate = amountOut / amountIn;
    return formatAmount(rate.toString(), 6);
  };

  /**
   * Format price impact percentage
   */
  const formatPriceImpact = (impact: number): string => {
    return `${impact > 0 ? '+' : ''}${impact.toFixed(2)}%`;
  };

  /**
   * Get price impact color based on severity
   */
  const getPriceImpactColor = (impact: number): string => {
    if (Math.abs(impact) < 1) {
      return isDarkMode ? '#10B981' : '#059669'; // Green
    }
    if (Math.abs(impact) < 3) {
      return isDarkMode ? '#F59E0B' : '#D97706'; // Yellow
    }
    return '#EF4444'; // Red
  };

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <View className={`rounded-xl p-4 ${isDarkMode ? 'bg-background-secondary' : 'bg-gray-50'}`}>
        <View className="flex-row items-center justify-center py-4">
          <ActivityIndicator size="small" />
          <Text className={`ml-3 text-sm ${isDarkMode ? 'text-text-secondary' : 'text-gray-500'}`}>
            {t('swap.routeInfo.findingRoute', {
              defaultValue: 'Finding best route...',
            })}
          </Text>
        </View>
      </View>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <View
        className={`rounded-xl p-4 border ${
          isDarkMode ? 'bg-red-900/20 border-red-500/50' : 'bg-red-50 border-red-200'
        }`}
      >
        <View className="flex-row items-center mb-3">
          <Icon name="AlertCircle" size={16} color="#EF4444" />
          <Text className="ml-2 text-sm text-system-error flex-1">{error}</Text>
        </View>
        {onRetry && (
          <TouchableOpacity
            onPress={onRetry}
            className="bg-brand-primary px-4 py-2 rounded-lg self-start"
            activeOpacity={0.7}
          >
            <Text className="text-white text-sm font-medium">
              {t('swap.routeInfo.retry', { defaultValue: 'Retry' })}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  /**
   * Render empty state (no route yet)
   */
  if (!route) {
    return (
      <View className={`rounded-xl p-4 ${isDarkMode ? 'bg-background-secondary' : 'bg-gray-50'}`}>
        <Text
          className={`text-sm text-center ${isDarkMode ? 'text-text-secondary' : 'text-gray-500'}`}
        >
          {t('swap.routeInfo.enterAmount', {
            defaultValue: 'Enter an amount to see route details',
          })}
        </Text>
      </View>
    );
  }

  const exchangeRate = getExchangeRate();
  const isMultiHop = route.route.length > 1;

  return (
    <View
      className={`rounded-xl p-4 border ${
        isDarkMode ? 'bg-background-secondary border-border' : 'bg-white border-gray-200'
      }`}
    >
      {/* Exchange Rate */}
      {exchangeRate && (
        <View className="flex-row justify-between items-center mb-3">
          <Text className={`text-sm ${isDarkMode ? 'text-text-secondary' : 'text-gray-500'}`}>
            {t('swap.routeInfo.rate', { defaultValue: 'Rate' })}
          </Text>
          <Text
            className={`text-sm font-medium ${isDarkMode ? 'text-text-primary' : 'text-gray-900'}`}
          >
            1 = {exchangeRate}
          </Text>
        </View>
      )}

      {/* Estimated Output */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className={`text-sm ${isDarkMode ? 'text-text-secondary' : 'text-gray-500'}`}>
          {t('swap.routeInfo.estimatedOutput', {
            defaultValue: 'Estimated Output',
          })}
        </Text>
        <Text
          className={`text-sm font-medium ${isDarkMode ? 'text-text-primary' : 'text-gray-900'}`}
        >
          {formatAmount(route.amountOut)}
        </Text>
      </View>

      {/* Price Impact */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className={`text-sm ${isDarkMode ? 'text-text-secondary' : 'text-gray-500'}`}>
          {t('swap.routeInfo.priceImpact', { defaultValue: 'Price Impact' })}
        </Text>
        <Text
          className="text-sm font-medium"
          style={{ color: getPriceImpactColor(route.priceImpact) }}
        >
          {formatPriceImpact(route.priceImpact)}
        </Text>
      </View>

      {/* Route Path (for multi-hop swaps) */}
      {isMultiHop && (
        <View className={`mt-3 pt-3 border-t ${isDarkMode ? 'border-border' : 'border-gray-200'}`}>
          <Text className={`text-sm mb-2 ${isDarkMode ? 'text-text-secondary' : 'text-gray-500'}`}>
            {t('swap.routeInfo.routePath', { defaultValue: 'Route Path' })}
          </Text>
          <View className="flex-row items-center flex-wrap">
            {route.route.map((hop, index) => (
              <React.Fragment key={index}>
                {/* DEX Badge */}
                <View
                  className={`px-2 py-1 rounded ${
                    isDarkMode ? 'bg-background-tertiary' : 'bg-gray-100'
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      isDarkMode ? 'text-text-primary' : 'text-gray-700'
                    }`}
                  >
                    {hop.dex}
                  </Text>
                </View>

                {/* Arrow */}
                {index < route.route.length - 1 && (
                  <Icon
                    name="ChevronRight"
                    size={16}
                    color={isDarkMode ? '#9CA3AF' : '#6B7280'}
                    style={{ marginHorizontal: 4 }}
                  />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>
      )}

      {/* Warning for high price impact */}
      {Math.abs(route.priceImpact) >= 3 && (
        <View
          className={`mt-3 pt-3 border-t flex-row items-start ${
            isDarkMode ? 'border-border' : 'border-gray-200'
          }`}
        >
          <Icon name="AlertTriangle" size={16} color="#F59E0B" />
          <Text className="ml-2 text-xs text-yellow-600 flex-1">
            {t('swap.routeInfo.highPriceImpactWarning', {
              defaultValue: 'High price impact. Your trade may result in significant slippage.',
            })}
          </Text>
        </View>
      )}
    </View>
  );
};
