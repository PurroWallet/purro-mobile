import { Icon } from '@/components/Icon';
import { Colors } from '@/constants/colors';
import { apisWallet } from '@/core/apis';
import { useMarketTokens } from '@/hooks/market/useMarketTokens';
import { HomeScreenProps } from '@/types/navigation';
import { formatChangePercent, formatPriceUSD } from '@/utils/number';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';

/**
 * HomeScreen - Main wallet screen following Figma design
 * Shows account balance, action buttons, and account management
 */
const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [_currentAccount, setCurrentAccount] = useState<any>(null);
  const { tokens, loading, error } = useMarketTokens();

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      const accounts = await apisWallet.getAllAccounts(); 
      if (accounts && accounts.length > 0) {
        setCurrentAccount({
          address: accounts[0],
          name: 'Account 1',
        });
      }
    } catch (err) {
      console.error('Error loading wallet data:', err);
    }
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const renderHeader = () => (
    <View className="gap-6 px-5">
      <View className="flex-row items-center justify-between py-5">
        <View className="flex-row items-center gap-3">
          <Icon name="app-logo" size={48} />
          <Text className="text-[20px] font-semibold text-text-primary">
            Purro Wallet
          </Text>
        </View>
        <TouchableOpacity
          className="h-10 w-10 items-center justify-center"
          onPress={handleSettings}
          activeOpacity={0.8}
        >
          <Icon name="Settings" size={24} color={Colors.brand.primary} />
        </TouchableOpacity>
      </View>

      <View className="items-center py-4">
        <Text className="text-[48px] font-bold text-text-primary">
          $254.48
        </Text>
      </View>

      <View className="flex-row justify-between gap-2">
        <TouchableOpacity
          className="flex-1 items-center gap-2 rounded-xl bg-background-secondary py-3"
          onPress={() => Alert.alert('Send', 'Coming soon')}
          activeOpacity={0.8}
        >
          <Icon name="Send" size={28} color={Colors.brand.primary} />
          <Text className="text-label text-brand-primary">Send</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 items-center gap-2 rounded-xl bg-background-secondary py-3"
          onPress={() => Alert.alert('Receive', 'Coming soon')}
          activeOpacity={0.8}
        >
          <Icon name="Download" size={28} color={Colors.brand.primary} />
          <Text className="text-label text-brand-primary">Receive</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 items-center gap-2 rounded-xl bg-background-secondary py-3"
          onPress={() => Alert.alert('Swap', 'Coming soon')}
          activeOpacity={0.8}
        >
          <Icon name="RefreshCcw" size={28} color={Colors.brand.primary} />
          <Text className="text-label text-brand-primary">Swap</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 items-center gap-2 rounded-xl bg-background-secondary py-3"
          onPress={() => Alert.alert('Bridge', 'Coming soon')}
          activeOpacity={0.8}
        >
          <Icon name="GitCompare" size={28} color={Colors.brand.primary} />
          <Text className="text-label text-brand-primary">Bridge</Text>
        </TouchableOpacity>
      </View>

      <View className="mb-4">
        <Text className="text-[20px] font-semibold text-text-primary">
          Assets
        </Text>
      </View>
    </View>
  );

  const renderAssetItem = ({ item }: { item: any }) => {
    const isPositive = item.change24h !== null && item.change24h >= 0;

    return (
      <View className="mb-2 flex-row items-center rounded-xl bg-background-secondary px-3 py-3">
        {item.logo ? (
          <Image
            source={{ uri: item.logo }}
            className="h-10 w-10 rounded-full"
          />
        ) : (
          <View className="h-10 w-10 rounded-full bg-[rgba(106,114,130,0.12)]" />
        )}
        <View className="ml-3 flex-1">
          <Text className="text-[16px] font-semibold text-text-primary">
            {item.symbol}
          </Text>
          <Text className="text-[12px] text-text-secondary">{item.name}</Text>
        </View>
        <View className="ml-3 items-end">
          <Text className="text-[16px] font-semibold text-text-primary">
            {formatPriceUSD(item.priceUsd, { digits: 4 })}
          </Text>
          <Text
            className={`text-caption ${
              isPositive ? 'text-system-success' : 'text-system-error'
            }`}
          >
            {formatChangePercent(item.change24h)}
          </Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View className="items-center gap-3 rounded-2xl bg-background-secondary px-10 py-10">
      <View className="mb-2 h-16 w-16 rounded-full bg-[rgba(106,114,130,0.2)]" />
      <Text className="text-[16px] font-semibold text-text-primary">
        No Assets Yet
      </Text>
      <Text className="text-center text-label text-text-secondary">
        Your tokens will appear here once you receive them
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View className="items-center gap-3 rounded-2xl bg-background-secondary px-10 py-10">
      <Text className="text-[16px] font-semibold text-text-primary">
        Failed to load assets
      </Text>
      <Text className="text-center text-label text-text-secondary">{error}</Text>
    </View>
  );

  const renderLoadingState = () => (
    <View className="items-center py-6">
      <ActivityIndicator size="small" color={Colors.brand.primary} />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      {loading ? (
        <View className="flex-1 bg-background-primary">
          {renderHeader()}
          <View className="px-5">{renderLoadingState()}</View>
        </View>
      ) : error ? (
        <View className="flex-1 bg-background-primary">
          {renderHeader()}
          <View className="px-5">{renderErrorState()}</View>
        </View>
      ) : tokens.length === 0 ? (
        <View className="flex-1 bg-background-primary">
          {renderHeader()}
          <View className="px-5">{renderEmptyState()}</View>
        </View>
      ) : (
        <FlatList
          data={tokens}
          keyExtractor={item => item.id}
          renderItem={renderAssetItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default HomeScreen;
