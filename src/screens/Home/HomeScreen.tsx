import { useFocusEffect } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { Alert, Image as RNImage, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DefaultIcon from '@/assets/common/icon.png';
import AccountBottomSheet, { type AccountBottomSheetRef } from '@/components/AccountBottomSheet';
import { Icon } from '@/components/Icon';
import { apisKeychain, apisLock, apisWallet } from '@/core/apis';
import { useCurrentAccount } from '@/core/hooks/wallet/useCurrentAccount';
import { useAppStore } from '@/stores/appStore';
import { useTranslation } from '@/utils/i18n';
import ReceiveTokenSheet, { ReceiveTokenSheetRef } from './Home/components/ReceiveTokenSheet';
import SentTokenSheet, { SentTokenSheetRef } from './Home/components/SendTokenSheet';

interface Account {
  address: string;
  type?: string;
  brandName?: string;
  alianName?: string;
}

interface PerpPosition {
  id: string;
  name: string;
  multiplier: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
}

interface Token {
  id: string;
  name: string;
  symbol: string;
  balance: string;
  value: string;
}

const HomeScreen: React.FC = () => {
  const { t } = useTranslation();

  const accountBottomSheetRef = useRef<AccountBottomSheetRef>(null);
  const sentTokenSheetRef = useRef<SentTokenSheetRef>(null);
  const receiveTokenSheetRef = useRef<ReceiveTokenSheetRef>(null);

  const setWalletExists = useAppStore((state) => state.setWalletExists);
  const [selectedTab, setSelectedTab] = useState<'EVM' | 'Spot' | 'Perpetuals'>('EVM');
  const {
    currentAccount: currentAccountQuery,
    refetchCurrentAccount,
    setCurrentAccount: setCurrentAccountQuery,
  } = useCurrentAccount();
  const currentAccount = currentAccountQuery as Account | null;

  const [perpPositions] = useState<PerpPosition[]>([
    {
      id: '1',
      name: 'Lilly',
      multiplier: '20x',
      value: '$111,638',
      change: '-20%',
      changeType: 'negative',
    },
    {
      id: '2',
      name: 'LIQD',
      multiplier: '20x',
      value: '$111,638',
      change: '-20%',
      changeType: 'negative',
    },
    {
      id: '3',
      name: 'LIQD',
      multiplier: '20x',
      value: '$111,638',
      change: '-20%',
      changeType: 'negative',
    },
  ]);

  const [tokens] = useState<Token[]>([
    {
      id: '1',
      name: 'Hyperliquid',
      symbol: 'HYPE',
      balance: '0',
      value: '$0.00',
    },
  ]);

  useFocusEffect(
    React.useCallback(() => {
      refetchCurrentAccount();
    }, [refetchCurrentAccount]),
  );

  const handleAccountSelect = (account: Account) => {
    setCurrentAccountQuery(account);
  };

  const handleResetWallet = async () => {
    try {
      console.log('🔄 Resetting wallet...');

      // Reset wallet data
      apisWallet.resetWallet();

      // Lock wallet
      await apisLock.lockWallet();

      // Clear keychain data
      try {
        await apisKeychain.resetGenericPassword();
        console.log('🔑 Keychain data cleared');
      } catch (error) {
        console.log('🔑 No keychain data to clear:', error);
      }

      // Update wallet exists state
      setWalletExists(false);

      console.log('✅ Wallet reset complete, navigating to Welcome screen');

      // Navigate to Welcome screen
      // navigation.navigate('Welcome');
    } catch (error) {
      console.error('Error resetting wallet:', error);
      Alert.alert(t('errors.generic.title'), t('errors.wallet.resetFailed'));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      {/* Header with Glassmorphism */}
      <View className="px-6 pt-5 pb-2">
        {/* Account Info */}
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            className="flex-row items-center gap-4"
            onPress={() => accountBottomSheetRef.current?.present()}
          >
            <RNImage
              source={DefaultIcon}
              className="w-10 h-10 rounded-full border border-border-primary"
              resizeMode="cover"
            />
            <View>
              <Text className="text-text-secondary text-sm">
                {currentAccount?.address
                  ? `${currentAccount.address.slice(0, 6)}...${currentAccount.address.slice(-4)}`
                  : '@kycdict'}
              </Text>
              <Text className="text-text-primary text-2xl font-medium">
                {currentAccount?.alianName || 'Account 1'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity>
            <Icon name="search" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Balance Section */}
        <View className="items-center pt-10 pb-0">
          <Text className="text-text-primary text-5xl font-semibold">
            {t('home.balanceValue', { value: '$254.48' })}
          </Text>
        </View>
        {/* Action Buttons */}
        <View className="flex-row gap-2 px-6 py-5">
          <TouchableOpacity
            className="flex-1 items-center gap-3 rounded-xl bg-background-secondary py-4"
            onPress={() => sentTokenSheetRef.current?.present()}
          >
            <Icon name="send" size={24} />
            <Text className="text-text-primary text-sm">{t('home.send')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 rounded-xl bg-background-secondary py-4 items-center gap-3"
            onPress={() => receiveTokenSheetRef.current?.present()}
          >
            <Icon name="arrow-down-to-line" size={24} />
            <Text className="text-text-primary text-sm">{t('home.receive')}</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 rounded-xl bg-background-secondary py-4 items-center gap-3">
            <Icon name="repeat" size={24} />
            <Text className="text-text-primary text-sm">{t('home.swap')}</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 rounded-xl bg-background-secondary py-4 items-center gap-3">
            <Icon name="git-branch" size={24} />
            <Text className="text-text-primary text-sm">{t('home.bridge')}</Text>
          </TouchableOpacity>
        </View>
        {/* Accounts Horizontal Scroll */}
        <View className="pb-0 px-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            <View className="rounded-xl bg-background-secondary/60 px-4 py-4 flex-row items-center gap-3.5 min-w-[320px]">
              <RNImage
                source={DefaultIcon}
                className="w-10 h-10 rounded-full border-2 border-background-primary"
                resizeMode="cover"
              />
              <View className="flex-1">
                <Text className="text-text-primary text-lg">{t('home.createAccount')}</Text>
                <Text className="text-text-secondary text-sm">
                  {t('home.createAccountDescription')}
                </Text>
              </View>
              <Icon name="chevron-right" size={24} />
            </View>

            <View className="rounded-xl bg-background-secondary/60 px-4 py-4 flex-row items-center gap-3.5 min-w-[320px]">
              <RNImage
                source={DefaultIcon}
                className="w-10 h-10 rounded-full border-2 border-background-primary"
                resizeMode="cover"
              />
              <View className="flex-1">
                <Text className="text-text-primary text-lg">{t('home.createAccount')}</Text>
                <Text className="text-text-secondary text-sm">
                  {t('home.createAccountDescription')}
                </Text>
              </View>
              <Icon name="chevron-right" size={24} />
            </View>
          </ScrollView>
        </View>
        {/* Perps Section */}
        <View className="px-5 pt-10 pb-10">
          <View className="flex-row justify-between items-center px-0 pb-4">
            <Text className="text-text-primary text-lg font-semibold">{t('home.perps')}</Text>
            <TouchableOpacity>
              <Text className="text-brand-primary text-sm font-medium">{t('home.viewMore')}</Text>
            </TouchableOpacity>
          </View>

          {perpPositions.map((position) => (
            <View
              key={position.id}
              className="rounded-xl bg-background-secondary px-4 py-1 flex-row items-center gap-5 mb-2"
            >
              <RNImage source={DefaultIcon} className="w-12 h-12 rounded-full" resizeMode="cover" />
              <View className="flex-1 flex-row justify-between items-center py-5">
                <View className="gap-3">
                  <Text className="text-text-primary text-xl font-medium">{position.name}</Text>
                  <Text className="text-text-secondary text-sm">{position.multiplier}</Text>
                </View>
                <View className="items-end gap-3">
                  <Text className="text-text-primary text-xl font-medium text-right">
                    {position.value}
                  </Text>
                  <Text className="text-system-error text-sm">{position.change}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
        {/* EVM Section */}
        <View className="px-5 pb-10">
          {/* Tab Navigation */}
          <View className="flex-row items-center justify-between border-b border-border-secondary pb-0 mb-4">
            <View className="flex-row">
              <TouchableOpacity
                className={`px-2.5 py-2.5 ${
                  selectedTab === 'EVM' ? 'border-b-2 border-text-primary' : ''
                }`}
                onPress={() => setSelectedTab('EVM')}
              >
                <Text
                  className={`text-lg font-semibold ${
                    selectedTab === 'EVM' ? 'text-text-primary' : 'text-text-secondary'
                  }`}
                >
                  {t('home.tabs.evm')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`px-2.5 py-2.5 ${
                  selectedTab === 'Spot' ? 'border-b-2 border-text-primary' : ''
                }`}
                onPress={() => setSelectedTab('Spot')}
              >
                <Text
                  className={`text-lg font-semibold ${
                    selectedTab === 'Spot' ? 'text-text-primary' : 'text-text-secondary'
                  }`}
                >
                  {t('home.tabs.spot')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`px-2.5 py-2.5 ${
                  selectedTab === 'Perpetuals' ? 'border-b-2 border-text-primary' : ''
                }`}
                onPress={() => setSelectedTab('Perpetuals')}
              >
                <Text
                  className={`text-lg font-semibold ${
                    selectedTab === 'Perpetuals' ? 'text-text-primary' : 'text-text-secondary'
                  }`}
                >
                  {t('home.tabs.perpetuals')}
                </Text>
              </TouchableOpacity>
            </View>

            <Icon name="chevron-down" size={20} />
          </View>

          {/* Balance Cards */}
          <View className="flex-row gap-2 mb-2">
            <View className="flex-1 rounded-xl bg-background-secondary/60 p-5">
              <Text className="text-text-secondary text-base mb-3.5">{t('home.totalBalance')}</Text>
              <Text className="text-text-primary text-2xl font-medium">$345.64</Text>
            </View>
            <View className="flex-1 rounded-xl bg-background-secondary/60 p-5">
              <Text className="text-text-secondary text-base mb-3.5">{t('home.totalTokens')}</Text>
              <Text className="text-text-primary text-2xl font-medium">1</Text>
            </View>
          </View>

          {/* Token List */}
          {tokens.map((token) => (
            <View
              key={token.id}
              className="rounded-xl bg-background-secondary px-4 py-5 flex-row items-center gap-5 mb-2"
            >
              <RNImage source={DefaultIcon} className="w-12 h-12 rounded-full" resizeMode="cover" />
              <View className="flex-1 flex-row justify-between items-center py-5">
                <View className="gap-3">
                  <Text className="text-text-primary text-xl font-medium">{token.name}</Text>
                  <View className="flex-row gap-1.5">
                    <Text className="text-text-primary text-sm">{token.balance}</Text>
                    <Text className="text-text-secondary text-sm">{token.symbol}</Text>
                  </View>
                </View>
                <Text className="text-text-primary text-xl font-medium">{token.value}</Text>
              </View>
            </View>
          ))}

          {/* Add Token Button */}
          <TouchableOpacity className="rounded-xl bg-background-secondary px-4 py-6 flex-row items-center justify-center gap-2">
            <Icon name="plus" size={16} />
            <Text className="text-text-primary text-base text-right">
              {t('home.addTestnetToken')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AccountBottomSheet
        ref={accountBottomSheetRef}
        onClose={() => {}}
        onAccountSelect={handleAccountSelect}
        onResetWallet={handleResetWallet}
      />
      <SentTokenSheet ref={sentTokenSheetRef} onClose={() => {}} />
      <ReceiveTokenSheet
        ref={receiveTokenSheetRef}
        onClose={() => {}}
        onAccountSelect={handleAccountSelect}
        onResetWallet={handleResetWallet}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;
