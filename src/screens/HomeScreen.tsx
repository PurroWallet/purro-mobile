import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image as RNImage,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from '@/utils/i18n';
import { walletController } from '@/core/controllers/WalletController';
import { useAtom } from 'jotai';
import { walletExists } from '@/atoms/app';
import { apisLock, apisWallet, apisKeychain } from '@/core/apis';
import AccountBottomSheet, {
  type AccountBottomSheetRef,
} from '@/components/AccountBottomSheet';
import {
  Send,
  ArrowDownToLine,
  Repeat,
  GitBranch,
  ChevronDown,
  Plus,
  // Bell,
  ChevronRight,
  Home,
  ArrowLeftRight,
  Image,
  Compass,
  Search
} from 'lucide-react-native';
import type { HomeScreenProps } from '@/types/navigation';
import DefaultIcon from '@/assets/common/icon.png';

interface Account {
  address: string;
  type: string;
  brandName: string;
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

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const accountBottomSheetRef = useRef<AccountBottomSheetRef>(null);
  const [, setWalletExists] = useAtom(walletExists);
  const [selectedTab, setSelectedTab] = useState<'EVM' | 'Spot' | 'Perpetuals'>(
    'EVM',
  );

  // Mock data
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

  // Load account when screen comes into focus (after unlock)
  useFocusEffect(
    React.useCallback(() => {
      loadCurrentAccount();
    }, []),
  );

  const loadCurrentAccount = async () => {
    try {
      console.log('🔍 HomeScreen - Loading current account...');
      const account = await walletController.getCurrentAccount();
      console.log('👤 HomeScreen - Account:', JSON.stringify(account, null, 2));

      if (account?.address) {
        console.log('✅ HomeScreen - Setting account:', account.address);
        setCurrentAccount(account);
      } else {
        console.log(
          '⚠️ HomeScreen - No account from controller, trying getAllAccounts...',
        );
        const allAccounts = await walletController.getAllAccounts();
        console.log(
          '👥 HomeScreen - All accounts:',
          JSON.stringify(allAccounts, null, 2),
        );

        if (allAccounts && allAccounts.length > 0) {
          console.log(
            '✅ HomeScreen - Using first account:',
            allAccounts[0].address,
          );
          setCurrentAccount(allAccounts[0]);
        } else {
          console.log('❌ HomeScreen - No accounts found');
        }
      }
    } catch (error) {
      console.error('❌ HomeScreen - Error:', error);
    }
  };

  const handleAccountSelect = (account: Account) => {
    setCurrentAccount(account);
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
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } catch (error) {
      console.error('Error resetting wallet:', error);
      Alert.alert(t('errors.generic.title'), t('errors.wallet.resetFailed'));
    }
  };

  return (
    <View className="flex-1 bg-background-primary">
      {/* Header with Glassmorphism */}
      <View className="bg-background-primary/75 backdrop-blur-md">
        <SafeAreaView edges={['top']}>
          {/* Status Bar Area */}
          <View className="px-6 pt-5 pb-4">
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
                      ? `${currentAccount.address.slice(
                          0,
                          6,
                        )}...${currentAccount.address.slice(-4)}`
                      : '@kycdict'}
                  </Text>
                  <Text className="text-text-primary text-2xl font-medium">
                    {currentAccount?.alianName || 'Account 1'}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity>
                <Search size={24} color="rgb(var(--color-text-primary))" />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Balance Section */}
        <View className="items-center pt-10 pb-0">
          <Text className="text-text-primary text-5xl font-semibold">
            {t('home.balanceValue', { value: '$254.48' })}
          </Text>
        </View>
        {/* Action Buttons */}
        <View className="flex-row gap-2 px-6 py-5">
          <TouchableOpacity className="flex-1 rounded-xl bg-background-secondary py-4 items-center gap-3">
            <Send size={24} />
            <Text className="text-text-primary text-sm">{t('home.send')}</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 rounded-xl bg-background-secondary py-4 items-center gap-3">
            <ArrowDownToLine size={24}  />
                  <Text className="text-text-primary text-sm">{t('home.receive')}</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 rounded-xl bg-background-secondary py-4 items-center gap-3">
            <Repeat size={24}  />
                  <Text className="text-text-primary text-sm">{t('home.swap')}</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 rounded-xl bg-background-secondary py-4 items-center gap-3">
            <GitBranch size={24}  />
                  <Text className="text-text-primary text-sm">{t('home.bridge')}</Text>
          </TouchableOpacity>
        </View>
        {/* Accounts Horizontal Scroll */}
        <View className="pb-0">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
          >
            <View className="rounded-xl bg-background-secondary/60 px-4 py-4 flex-row items-center gap-3.5 min-w-[320px]">
              <RNImage
                source={DefaultIcon}
                className="w-10 h-10 rounded-full border-2 border-background-primary"
                resizeMode="cover"
              />
              <View className="flex-1">
                <Text className="text-text-primary text-lg">
                  {t('home.createAccount')}
                </Text>
                <Text className="text-text-secondary text-sm">
                  {t('home.createAccountDescription')}
                </Text>
              </View>
              <ChevronRight size={24} color="rgb(var(--color-text-primary))" />
            </View>

            <View className="rounded-xl bg-background-secondary/60 px-4 py-4 flex-row items-center gap-3.5 min-w-[320px]">
              <RNImage
                source={DefaultIcon}
                className="w-10 h-10 rounded-full border-2 border-background-primary"
                resizeMode="cover"
              />
              <View className="flex-1">
                <Text className="text-text-primary text-lg">
                  {t('home.createAccount')}
                </Text>
                <Text className="text-text-secondary text-sm">
                  {t('home.createAccountDescription')}
                </Text>
              </View>
            <ChevronRight size={24} color="rgb(var(--color-text-primary))" />
            </View>
          </ScrollView>
        </View>
        {/* Perps Section */}
        <View className="px-5 pt-10 pb-10">
          <View className="flex-row justify-between items-center px-0 pb-4">
          <Text className="text-text-primary text-lg font-semibold">{t('home.perps')}</Text>
            <TouchableOpacity>
              <Text className="text-brand-primary text-sm font-medium">
                {t('home.viewMore')}
              </Text>
            </TouchableOpacity>
          </View>

          {perpPositions.map(position => (
            <View
              key={position.id}
              className="rounded-xl bg-background-secondary px-4 py-1 flex-row items-center gap-5 mb-2"
            >
              <RNImage
                source={DefaultIcon}
                className="w-12 h-12 rounded-full"
                resizeMode="cover"
              />
              <View className="flex-1 flex-row justify-between items-center py-5">
                <View className="gap-3">
                  <Text className="text-text-primary text-xl font-medium">
                    {position.name}
                  </Text>
                  <Text className="text-text-secondary text-sm">
                    {position.multiplier}
                  </Text>
                </View>
                <View className="items-end gap-3">
                  <Text className="text-text-primary text-xl font-medium text-right">
                    {position.value}
                  </Text>
                  <Text className="text-system-error text-sm">
                    {position.change}
                  </Text>
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
                    selectedTab === 'Perpetuals'
                      ? 'text-text-primary'
                      : 'text-text-secondary'
                  }`}
                >
                  {t('home.tabs.perpetuals')}
                </Text>
              </TouchableOpacity>
            </View>

            <ChevronDown size={20} color="rgb(var(--color-text-primary))" />
          </View>

          {/* Balance Cards */}
          <View className="flex-row gap-2 mb-2">
            <View className="flex-1 rounded-xl bg-background-secondary/60 p-5">
              <Text className="text-text-secondary text-base mb-3.5">
                {t('home.totalBalance')}
              </Text>
              <Text className="text-text-primary text-2xl font-medium">
                $345.64
              </Text>
            </View>
            <View className="flex-1 rounded-xl bg-background-secondary/60 p-5">
              <Text className="text-text-secondary text-base mb-3.5">
                {t('home.totalTokens')}
              </Text>
              <Text className="text-text-primary text-2xl font-medium">1</Text>
            </View>
          </View>

          {/* Token List */}
          {tokens.map(token => (
            <View
              key={token.id}
              className="rounded-xl bg-background-secondary px-4 py-5 flex-row items-center gap-5 mb-2"
            >
              <RNImage
                source={DefaultIcon}
                className="w-12 h-12 rounded-full"
                resizeMode="cover"
              />
              <View className="flex-1 flex-row justify-between items-center py-5">
                <View className="gap-3">
                  <Text className="text-text-primary text-xl font-medium">
                    {token.name}
                  </Text>
                  <View className="flex-row gap-1.5">
                    <Text className="text-text-primary text-sm">
                      {token.balance}
                    </Text>
                    <Text className="text-text-secondary text-sm">
                      {token.symbol}
                    </Text>
                  </View>
                </View>
                <Text className="text-text-primary text-xl font-medium">
                  {token.value}
                </Text>
              </View>
            </View>
          ))}

          {/* Add Token Button */}
          <TouchableOpacity className="rounded-xl bg-background-secondary px-4 py-6 flex-row items-center justify-center gap-2">
          <Plus size={16} color="rgb(var(--color-text-primary))" />
            <Text className="text-text-primary text-base text-right">
              {t('home.addTestnetToken')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {/* Bottom Navigation (Glassmorphism) */}
      <View className="absolute bottom-0 left-0 right-0 bg-background-secondary px-8">
        <SafeAreaView edges={['bottom']}>
          <View className="flex-row justify-between items-center">
            <TouchableOpacity className="items-center py-2.5 border-t-2 border-brand-primary">
              <Home
                size={24}
                
                strokeWidth={2}
                className="mb-1"
              />
              <Text className="text-brand-primary text-xs font-medium">{t('home.nav.home')}</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center py-2.5">
              <ArrowLeftRight
                size={24}
                color="rgb(var(--color-text-secondary))"
                strokeWidth={2}
                className="mb-1"
              />
              <Text className="text-text-secondary text-xs">{t('home.nav.swap')}</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center py-2.5">
              <Image
                size={24}
                color="rgb(var(--color-text-secondary))"
                strokeWidth={2}
                className="mb-1"
              />
              <Text className="text-text-secondary text-xs">{t('home.nav.nft')}</Text>
            </TouchableOpacity>

            <TouchableOpacity className="items-center py-2.5">
              <Compass
                size={24}
                color="rgb(var(--color-text-secondary))"
                strokeWidth={2}
                className="mb-1"
              />
              <Text className="text-text-secondary text-xs">{t('home.nav.dapps')}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
      <AccountBottomSheet
        ref={accountBottomSheetRef}
        onClose={() => {}}
        currentAccount={currentAccount}
        onAccountSelect={handleAccountSelect}
        navigation={navigation}
        onResetWallet={handleResetWallet}
      />
    </View>
  );
};

export default HomeScreen;
