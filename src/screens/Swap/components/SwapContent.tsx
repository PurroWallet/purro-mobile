import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import type { Token } from '@/core/apis/liquidswap/types';
import { useThemeMode } from '@/core/hooks/useTheme';
import { useSwap } from '@/core/hooks/wallet/useSwap';
import { walletService } from '@/core/services/WalletService';
import type { UseSwapScreenResult } from '../hooks/useSwapScreen';
import { SwapRouteInfo } from './SwapRouteInfo';
import { TokenSelector } from './TokenSelector';

type SwapContentProps = UseSwapScreenResult;

export const SwapContent: React.FC<SwapContentProps> = ({ containerClassName }) => {
  const { t } = useTranslation();
  const { themeMode } = useThemeMode();
  const isDarkMode = themeMode === 'dark';

  // Swap hook
  const {
    route,
    isLoadingRoute,
    routeError,
    tokenSelection,
    setTokenIn,
    setTokenOut,
    swapTokens,
    slippage,
    setSlippage,
    findRoute,
    clearRoute,
    executeSwap,
    isExecuting,
    executionError,
    executionSuccess,
    clearExecutionState,
  } = useSwap();

  // Local state
  const [amountIn, setAmountIn] = useState('');
  const [showTokenInSelector, setShowTokenInSelector] = useState(false);
  const [showTokenOutSelector, setShowTokenOutSelector] = useState(false);
  const [showSlippageSettings, setShowSlippageSettings] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');

  /**
   * Load wallet address on mount
   */
  useEffect(() => {
    const loadWalletAddress = async () => {
      try {
        const account = await walletService.getCurrentAccount();
        if (account?.address) {
          setWalletAddress(account.address);
        }
      } catch (error) {
        console.error('Failed to load wallet address:', error);
      }
    };

    loadWalletAddress();
  }, []);

  /**
   * Find route when inputs change
   */
  useEffect(() => {
    if (tokenSelection.tokenIn && tokenSelection.tokenOut && amountIn && parseFloat(amountIn) > 0) {
      findRoute({
        tokenIn: tokenSelection.tokenIn.address,
        tokenOut: tokenSelection.tokenOut.address,
        amountIn,
        multiHop: true,
      });
    } else {
      clearRoute();
    }
  }, [tokenSelection.tokenIn, tokenSelection.tokenOut, amountIn, findRoute, clearRoute]);

  /**
   * Handle token selection
   */
  const handleSelectTokenIn = useCallback(
    (token: Token) => {
      setTokenIn(token);
    },
    [setTokenIn],
  );

  const handleSelectTokenOut = useCallback(
    (token: Token) => {
      setTokenOut(token);
    },
    [setTokenOut],
  );

  /**
   * Handle swap direction
   */
  const handleSwapDirection = useCallback(() => {
    swapTokens();
    setAmountIn('');
  }, [swapTokens]);

  /**
   * Handle swap button press - show confirmation dialog
   */
  const handleSwapButtonPress = useCallback(() => {
    setShowConfirmDialog(true);
  }, []);

  /**
   * Handle swap execution after confirmation
   */
  const handleConfirmSwap = useCallback(async () => {
    if (!walletAddress) {
      console.error('No wallet address available');
      return;
    }

    setShowConfirmDialog(false);
    await executeSwap(walletAddress);
  }, [executeSwap, walletAddress]);

  /**
   * Handle amount input change
   */
  const handleAmountChange = (text: string) => {
    // Allow only numbers and decimal point
    const sanitized = text.replace(/[^0-9.]/g, '');

    // Prevent multiple decimal points
    const parts = sanitized.split('.');
    if (parts.length > 2) {
      return;
    }

    setAmountIn(sanitized);
  };

  /**
   * Render slippage settings
   */
  const renderSlippageSettings = () => {
    const presetSlippages = [0.5, 1, 3];

    return (
      <View
        className={`mt-4 p-4 rounded-xl border ${
          isDarkMode ? 'bg-background-secondary border-border' : 'bg-gray-50 border-gray-200'
        }`}
      >
        <View className="flex-row justify-between items-center mb-3">
          <Text
            className={`text-sm font-medium ${isDarkMode ? 'text-text-primary' : 'text-gray-900'}`}
          >
            {t('swap.slippage.title', { defaultValue: 'Slippage Tolerance' })}
          </Text>
          <TouchableOpacity onPress={() => setShowSlippageSettings(false)}>
            <Icon name="X" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-2 mb-3">
          {presetSlippages.map((preset) => (
            <TouchableOpacity
              key={preset}
              className={`flex-1 py-2 rounded-lg ${
                slippage === preset
                  ? 'bg-brand-primary'
                  : isDarkMode
                    ? 'bg-background-tertiary'
                    : 'bg-white border border-gray-200'
              }`}
              onPress={() => setSlippage(preset)}
            >
              <Text
                className={`text-center text-sm font-medium ${
                  slippage === preset
                    ? 'text-white'
                    : isDarkMode
                      ? 'text-text-primary'
                      : 'text-gray-900'
                }`}
              >
                {preset}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="flex-row items-center">
          <TextInput
            className={`flex-1 px-3 py-2 rounded-lg border ${
              isDarkMode
                ? 'bg-background-tertiary border-border text-text-primary'
                : 'bg-white border-gray-200 text-gray-900'
            }`}
            placeholder={t('swap.slippage.custom', { defaultValue: 'Custom' })}
            placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
            keyboardType="decimal-pad"
            value={presetSlippages.includes(slippage) ? '' : slippage.toString()}
            onChangeText={(text) => {
              const value = parseFloat(text);
              if (!isNaN(value) && value >= 0 && value <= 50) {
                setSlippage(value);
              }
            }}
          />
          <Text className={`ml-2 text-sm ${isDarkMode ? 'text-text-secondary' : 'text-gray-500'}`}>
            %
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className={containerClassName} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="mb-6">
            <Text
              className={`text-2xl font-bold ${isDarkMode ? 'text-text-primary' : 'text-gray-900'}`}
            >
              {t('swap.title', { defaultValue: 'Swap' })}
            </Text>
          </View>

          {/* Token In */}
          <View
            className={`rounded-xl p-4 border ${
              isDarkMode ? 'bg-background-secondary border-border' : 'bg-white border-gray-200'
            }`}
          >
            <Text
              className={`text-sm mb-2 ${isDarkMode ? 'text-text-secondary' : 'text-gray-500'}`}
            >
              {t('swap.from', { defaultValue: 'From' })}
            </Text>

            <View className="flex-row items-center">
              <TextInput
                className={`flex-1 text-2xl font-semibold ${
                  isDarkMode ? 'text-text-primary' : 'text-gray-900'
                }`}
                placeholder="0.0"
                placeholderTextColor={isDarkMode ? '#4B5563' : '#D1D5DB'}
                keyboardType="decimal-pad"
                value={amountIn}
                onChangeText={handleAmountChange}
              />

              <TouchableOpacity
                className={`flex-row items-center px-3 py-2 rounded-lg ${
                  isDarkMode ? 'bg-background-tertiary' : 'bg-gray-100'
                }`}
                onPress={() => setShowTokenInSelector(true)}
              >
                {tokenSelection.tokenIn ? (
                  <>
                    <Text
                      className={`text-base font-semibold mr-1 ${
                        isDarkMode ? 'text-text-primary' : 'text-gray-900'
                      }`}
                    >
                      {tokenSelection.tokenIn.symbol}
                    </Text>
                    <Icon name="ChevronDown" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                  </>
                ) : (
                  <>
                    <Text
                      className={`text-base font-medium mr-1 ${
                        isDarkMode ? 'text-text-secondary' : 'text-gray-500'
                      }`}
                    >
                      {t('swap.selectToken', { defaultValue: 'Select' })}
                    </Text>
                    <Icon name="ChevronDown" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Swap Direction Button */}
          <View className="items-center -my-3 z-10">
            <TouchableOpacity
              className={`w-10 h-10 rounded-full items-center justify-center border-4 ${
                isDarkMode
                  ? 'bg-background-secondary border-background-primary'
                  : 'bg-white border-gray-50'
              }`}
              onPress={handleSwapDirection}
            >
              <Icon name="ArrowDownUp" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          </View>

          {/* Token Out */}
          <View
            className={`rounded-xl p-4 border ${
              isDarkMode ? 'bg-background-secondary border-border' : 'bg-white border-gray-200'
            }`}
          >
            <Text
              className={`text-sm mb-2 ${isDarkMode ? 'text-text-secondary' : 'text-gray-500'}`}
            >
              {t('swap.to', { defaultValue: 'To' })}
            </Text>

            <View className="flex-row items-center">
              <Text
                className={`flex-1 text-2xl font-semibold ${
                  isDarkMode ? 'text-text-primary' : 'text-gray-900'
                }`}
              >
                {route ? parseFloat(route.amountOut).toFixed(6) : '0.0'}
              </Text>

              <TouchableOpacity
                className={`flex-row items-center px-3 py-2 rounded-lg ${
                  isDarkMode ? 'bg-background-tertiary' : 'bg-gray-100'
                }`}
                onPress={() => setShowTokenOutSelector(true)}
              >
                {tokenSelection.tokenOut ? (
                  <>
                    <Text
                      className={`text-base font-semibold mr-1 ${
                        isDarkMode ? 'text-text-primary' : 'text-gray-900'
                      }`}
                    >
                      {tokenSelection.tokenOut.symbol}
                    </Text>
                    <Icon name="ChevronDown" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                  </>
                ) : (
                  <>
                    <Text
                      className={`text-base font-medium mr-1 ${
                        isDarkMode ? 'text-text-secondary' : 'text-gray-500'
                      }`}
                    >
                      {t('swap.selectToken', { defaultValue: 'Select' })}
                    </Text>
                    <Icon name="ChevronDown" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Slippage Settings Button */}
          <TouchableOpacity
            className="flex-row items-center justify-between mt-4"
            onPress={() => setShowSlippageSettings(!showSlippageSettings)}
          >
            <Text className={`text-sm ${isDarkMode ? 'text-text-secondary' : 'text-gray-500'}`}>
              {t('swap.slippage.label', { defaultValue: 'Slippage Tolerance' })}
            </Text>
            <View className="flex-row items-center">
              <Text
                className={`text-sm font-medium mr-1 ${
                  isDarkMode ? 'text-text-primary' : 'text-gray-900'
                }`}
              >
                {slippage}%
              </Text>
              <Icon
                name={showSlippageSettings ? 'ChevronUp' : 'ChevronDown'}
                size={16}
                color={isDarkMode ? '#9CA3AF' : '#6B7280'}
              />
            </View>
          </TouchableOpacity>

          {/* Slippage Settings Panel */}
          {showSlippageSettings && renderSlippageSettings()}

          {/* Route Info */}
          <View className="mt-4">
            <SwapRouteInfo
              route={route}
              isLoading={isLoadingRoute}
              error={routeError?.message || null}
              onRetry={() => {
                if (
                  tokenSelection.tokenIn &&
                  tokenSelection.tokenOut &&
                  amountIn &&
                  parseFloat(amountIn) > 0
                ) {
                  findRoute({
                    tokenIn: tokenSelection.tokenIn.address,
                    tokenOut: tokenSelection.tokenOut.address,
                    amountIn,
                    multiHop: true,
                  });
                }
              }}
            />
          </View>

          {/* Execution Success Message */}
          {executionSuccess && (
            <View
              className={`mt-4 p-4 rounded-xl border ${
                isDarkMode ? 'bg-green-900/20 border-green-500/50' : 'bg-green-50 border-green-200'
              }`}
            >
              <View className="flex-row items-center">
                <Icon name="CheckCircle" size={20} color="#10B981" />
                <Text className="ml-2 text-sm text-green-600 flex-1">
                  {t('swap.success', {
                    defaultValue: 'Swap executed successfully!',
                  })}
                </Text>
              </View>
            </View>
          )}

          {/* Execution Error Message */}
          {executionError && (
            <View
              className={`mt-4 p-4 rounded-xl border ${
                isDarkMode ? 'bg-red-900/20 border-red-500/50' : 'bg-red-50 border-red-200'
              }`}
            >
              <View className="flex-row items-center">
                <Icon name="AlertCircle" size={20} color="#EF4444" />
                <Text className="ml-2 text-sm text-system-error flex-1">
                  {executionError.message}
                </Text>
              </View>
            </View>
          )}

          {/* Swap Button */}
          <View className="mt-6">
            <Button
              title={
                isExecuting
                  ? t('swap.executing', { defaultValue: 'Swapping...' })
                  : t('swap.button', { defaultValue: 'Swap' })
              }
              onPress={handleSwapButtonPress}
              disabled={
                !route ||
                isLoadingRoute ||
                isExecuting ||
                !tokenSelection.tokenIn ||
                !tokenSelection.tokenOut ||
                !amountIn ||
                parseFloat(amountIn) <= 0
              }
              type="primary"
              size="lg"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Token Selectors */}
      <TokenSelector
        visible={showTokenInSelector}
        onClose={() => setShowTokenInSelector(false)}
        onSelectToken={handleSelectTokenIn}
        selectedToken={tokenSelection.tokenIn}
        walletAddress={walletAddress}
      />

      <TokenSelector
        visible={showTokenOutSelector}
        onClose={() => setShowTokenOutSelector(false)}
        onSelectToken={handleSelectTokenOut}
        selectedToken={tokenSelection.tokenOut}
        walletAddress={walletAddress}
      />

      {/* Confirmation Dialog */}
      <Modal
        visible={showConfirmDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmDialog(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View
            className={`w-full rounded-2xl p-6 ${
              isDarkMode ? 'bg-background-secondary' : 'bg-white'
            }`}
          >
            {/* Header */}
            <View className="items-center mb-4">
              <View
                className={`w-12 h-12 rounded-full items-center justify-center mb-3 ${
                  isDarkMode ? 'bg-brand-primary/20' : 'bg-blue-50'
                }`}
              >
                <Icon name="ArrowDownUp" size={24} color="#3B82F6" />
              </View>
              <Text
                className={`text-xl font-bold ${
                  isDarkMode ? 'text-text-primary' : 'text-gray-900'
                }`}
              >
                {t('swap.confirm.title', { defaultValue: 'Confirm Swap' })}
              </Text>
            </View>

            {/* Swap Details */}
            <View
              className={`rounded-xl p-4 mb-4 ${
                isDarkMode ? 'bg-background-tertiary' : 'bg-gray-50'
              }`}
            >
              {/* From */}
              <View className="flex-row justify-between items-center mb-3">
                <Text className={`text-sm ${isDarkMode ? 'text-text-secondary' : 'text-gray-500'}`}>
                  {t('swap.confirm.from', { defaultValue: 'From' })}
                </Text>
                <Text
                  className={`text-base font-semibold ${
                    isDarkMode ? 'text-text-primary' : 'text-gray-900'
                  }`}
                >
                  {amountIn} {tokenSelection.tokenIn?.symbol}
                </Text>
              </View>

              {/* Arrow */}
              <View className="items-center my-2">
                <Icon name="ArrowDown" size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              </View>

              {/* To */}
              <View className="flex-row justify-between items-center">
                <Text className={`text-sm ${isDarkMode ? 'text-text-secondary' : 'text-gray-500'}`}>
                  {t('swap.confirm.to', { defaultValue: 'To' })}
                </Text>
                <Text
                  className={`text-base font-semibold ${
                    isDarkMode ? 'text-text-primary' : 'text-gray-900'
                  }`}
                >
                  {route ? parseFloat(route.amountOut).toFixed(6) : '0.0'}{' '}
                  {tokenSelection.tokenOut?.symbol}
                </Text>
              </View>
            </View>

            {/* Price Impact Warning */}
            {route && Math.abs(route.priceImpact) >= 3 && (
              <View
                className={`rounded-xl p-3 mb-4 flex-row items-start ${
                  isDarkMode
                    ? 'bg-yellow-900/20 border border-yellow-500/50'
                    : 'bg-yellow-50 border border-yellow-200'
                }`}
              >
                <Icon name="AlertTriangle" size={16} color="#F59E0B" />
                <Text className="ml-2 text-xs text-yellow-600 flex-1">
                  {t('swap.confirm.highPriceImpact', {
                    defaultValue: 'High price impact detected. Please review carefully.',
                  })}
                </Text>
              </View>
            )}

            {/* Slippage Info */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className={`text-sm ${isDarkMode ? 'text-text-secondary' : 'text-gray-500'}`}>
                {t('swap.confirm.slippage', { defaultValue: 'Slippage' })}
              </Text>
              <Text
                className={`text-sm font-medium ${
                  isDarkMode ? 'text-text-primary' : 'text-gray-900'
                }`}
              >
                {slippage}%
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                className={`flex-1 py-3 rounded-xl border ${
                  isDarkMode ? 'border-border bg-background-tertiary' : 'border-gray-200 bg-white'
                }`}
                onPress={() => setShowConfirmDialog(false)}
              >
                <Text
                  className={`text-center text-base font-semibold ${
                    isDarkMode ? 'text-text-primary' : 'text-gray-900'
                  }`}
                >
                  {t('swap.confirm.cancel', { defaultValue: 'Cancel' })}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 py-3 rounded-xl bg-brand-primary"
                onPress={handleConfirmSwap}
              >
                <Text className="text-center text-base font-semibold text-white">
                  {t('swap.confirm.confirm', { defaultValue: 'Confirm' })}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
