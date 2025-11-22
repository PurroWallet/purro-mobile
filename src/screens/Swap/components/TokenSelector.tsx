import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from '@/components/Icon';
import { liquidswapService } from '@/core/apis/liquidswap/liquidswapService';
import type { Token } from '@/core/apis/liquidswap/types';
import { useThemeMode } from '@/core/hooks/useTheme';

interface TokenSelectorProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Callback when a token is selected */
  onSelectToken: (token: Token) => void;
  /** Currently selected token (to highlight) */
  selectedToken?: Token | null;
  /** Wallet address for fetching balances */
  walletAddress?: string;
}

/**
 * TokenSelector Component
 * Modal component for selecting tokens with search functionality
 */
export const TokenSelector: React.FC<TokenSelectorProps> = ({
  visible,
  onClose,
  onSelectToken,
  selectedToken,
  walletAddress,
}) => {
  const { t } = useTranslation();
  const { themeMode } = useThemeMode();
  const isDarkMode = themeMode === 'dark';

  // State
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Fetch tokens from API
   */
  const fetchTokens = useCallback(
    async (search?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await liquidswapService.fetchTokens({
          search,
          limit: 100,
        });

        setTokens(response.tokens);
      } catch (err) {
        console.error('Failed to fetch tokens:', err);
        setError(
          t('swap.tokenSelector.errorFetchingTokens', {
            defaultValue: 'Failed to load tokens',
          }),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [t],
  );

  /**
   * Load tokens when modal opens
   */
  useEffect(() => {
    if (visible) {
      fetchTokens();
    }
  }, [visible, fetchTokens]);

  /**
   * Handle search input change with debouncing
   */
  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        fetchTokens(searchQuery.trim());
      } else {
        fetchTokens();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, visible, fetchTokens]);

  /**
   * Handle token selection
   */
  const handleSelectToken = (token: Token) => {
    onSelectToken(token);
    onClose();
    setSearchQuery('');
  };

  /**
   * Render token item
   */
  const renderTokenItem = ({ item }: { item: Token }) => {
    const isSelected = selectedToken?.address === item.address;

    return (
      <TouchableOpacity
        className={`flex-row items-center px-4 py-3 ${
          isSelected ? (isDarkMode ? 'bg-brand-primary/20' : 'bg-brand-primary/10') : ''
        }`}
        onPress={() => handleSelectToken(item)}
        activeOpacity={0.7}
      >
        {/* Token Logo */}
        <View className="w-10 h-10 rounded-full bg-background-tertiary items-center justify-center mr-3">
          {item.logoURI ? (
            <Image
              source={{ uri: item.logoURI }}
              className="w-10 h-10 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <Text className="text-text-secondary text-sm font-medium">
              {item.symbol.substring(0, 2).toUpperCase()}
            </Text>
          )}
        </View>

        {/* Token Info */}
        <View className="flex-1">
          <Text
            className={`text-base font-semibold ${
              isDarkMode ? 'text-text-primary' : 'text-gray-900'
            }`}
          >
            {item.symbol}
          </Text>
          <Text className={`text-sm ${isDarkMode ? 'text-text-secondary' : 'text-gray-500'}`}>
            {item.name}
          </Text>
        </View>

        {/* Selected Indicator */}
        {isSelected && <Icon name="Check" size={16} color={isDarkMode ? '#3B82F6' : '#2563EB'} />}
      </TouchableOpacity>
    );
  };

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <View className="items-center justify-center py-20">
      <Text className={`text-base ${isDarkMode ? 'text-text-secondary' : 'text-gray-500'}`}>
        {searchQuery
          ? t('swap.tokenSelector.noTokensFound', {
              defaultValue: 'No tokens found',
            })
          : t('swap.tokenSelector.noTokens', {
              defaultValue: 'No tokens available',
            })}
      </Text>
    </View>
  );

  /**
   * Render error state
   */
  const renderErrorState = () => (
    <View className="items-center justify-center py-20">
      <Text className="text-system-error text-base mb-4">{error}</Text>
      <TouchableOpacity
        className="bg-brand-primary px-6 py-3 rounded-lg"
        onPress={() => fetchTokens(searchQuery || undefined)}
      >
        <Text className="text-white font-medium">
          {t('swap.tokenSelector.retry', { defaultValue: 'Retry' })}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className={`flex-1 ${isDarkMode ? 'bg-background-primary' : 'bg-white'}`}>
        {/* Header */}
        <View
          className={`flex-row items-center justify-between px-4 py-4 border-b ${
            isDarkMode ? 'border-border' : 'border-gray-200'
          }`}
        >
          <Text
            className={`text-xl font-bold ${isDarkMode ? 'text-text-primary' : 'text-gray-900'}`}
          >
            {t('swap.tokenSelector.title', { defaultValue: 'Select Token' })}
          </Text>
          <TouchableOpacity onPress={onClose} className="p-2">
            <Icon name="X" size={24} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
          </TouchableOpacity>
        </View>

        {/* Search Input */}
        <View className="px-4 py-3">
          <View
            className={`flex-row items-center rounded-xl border px-4 py-3 ${
              isDarkMode ? 'border-border bg-background-secondary' : 'border-gray-200 bg-gray-50'
            }`}
          >
            <Icon name="Search" size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            <TextInput
              className={`flex-1 ml-2 text-base ${
                isDarkMode ? 'text-text-primary' : 'text-gray-900'
              }`}
              placeholder={t('swap.tokenSelector.searchPlaceholder', {
                defaultValue: 'Search by name or symbol',
              })}
              placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="X" size={18} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Token List */}
        <View className="flex-1">
          {isLoading ? (
            <View className="items-center justify-center py-20">
              <ActivityIndicator size="large" />
              <Text
                className={`mt-4 text-sm ${isDarkMode ? 'text-text-secondary' : 'text-gray-500'}`}
              >
                {t('swap.tokenSelector.loading', {
                  defaultValue: 'Loading tokens...',
                })}
              </Text>
            </View>
          ) : error ? (
            renderErrorState()
          ) : tokens.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={tokens}
              renderItem={renderTokenItem}
              keyExtractor={(item) => item.address}
              ItemSeparatorComponent={() => (
                <View className={`h-px ${isDarkMode ? 'bg-border' : 'bg-gray-200'} mx-4`} />
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};
