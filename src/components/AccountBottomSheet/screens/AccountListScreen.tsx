import { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import type { NavigationProp } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChevronRight, Edit2, Settings } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import DefaultIcon from '@/assets/common/icon.png';
import { Icon } from '@/components/Icon';
import { walletController } from '@/core/controllers/WalletController';
import type { AccountStackParamList } from '../AccountStackNavigator';

type Props = NativeStackScreenProps<AccountStackParamList, 'AccountList'> & {
  onClose: () => void;
  currentAccount: any;
  onAccountSelect: (account: any) => void;
  parentNavigation: NavigationProp<any>;
};

interface Account {
  address: string;
  type: string;
  brandName: string;
  alianName?: string;
}

interface Network {
  id: string;
  name: string;
  address: string;
  icon: string;
}

const AccountListScreen: React.FC<Props> = ({
  navigation,
  onClose,
  currentAccount,
  onAccountSelect,
  parentNavigation: _parentNavigation,
}) => {
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [accounts, setAccounts] = useState<Account[]>([]);

  // Mock networks data based on Figma design
  const networks: Network[] = [
    {
      id: 'hyperliquid',
      name: 'Hyperliquid',
      address: '0xe835...dE81',
      icon: 'network',
    },
    {
      id: 'ethereum',
      name: 'Ethereum',
      address: '0xe835...dE81',
      icon: 'network',
    },
    {
      id: 'arbitrum',
      name: 'Arbitrum',
      address: '0xe835...dE81',
      icon: 'network',
    },
    {
      id: 'base',
      name: 'Base',
      address: '0xe835...dE81',
      icon: 'network',
    },
  ];

  useFocusEffect(
    React.useCallback(() => {
      loadAccounts();
    }, []),
  );

  const loadAccounts = async () => {
    try {
      console.log('📋 AccountListScreen - Loading accounts...');
      const accountsList = await walletController.getAllAccounts();
      console.log('📋 AccountListScreen - Loaded accounts:', JSON.stringify(accountsList, null, 2));
      setAccounts(accountsList);
    } catch (error) {
      console.error('📋 AccountListScreen - Failed to load accounts:', error);
    }
  };

  const handleAccountPress = (account: Account) => {
    onAccountSelect(account);
    onClose();
  };

  const handleAddAccount = () => {
    navigation.navigate('AddAccount');
  };

  const handleEditAccount = (account: Account) => {
    navigation.navigate('EditAccount', { accountAddress: account.address });
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const currentAccountName = currentAccount?.alianName || 'Account 1';
  const currentAccountAddress = currentAccount?.address || '';

  return (
    <BottomSheetView
      className="flex-1"
      style={{
        backgroundColor: isDarkMode ? 'rgb(22 22 22)' : 'rgb(249 250 251)',
      }}
    >
      {/* Header - Avatar + Current Account + Settings Icon */}
      <View className="flex-row items-center justify-between px-6 py-6">
        <View className="flex-row items-center gap-2.5">
          <Image source={DefaultIcon} className="h-12 w-12 rounded-full" resizeMode="cover" />
          <View>
            <Text className="text-xl font-semibold text-text-primary">{currentAccountName}</Text>
            <Text className="text-sm text-text-secondary">
              {formatAddress(currentAccountAddress)}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleSettings} className="h-6 w-6 items-center justify-center">
          <Icon name="Settings" size={24} />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Networks Section */}
        <View className="px-5">
          <View className="rounded-2xl bg-background-secondary/60 px-5 py-0">
            {networks.map((network, index) => (
              <View key={network.id}>
                <TouchableOpacity
                  className="flex-row items-center justify-between py-4"
                  style={index < networks.length - 1 ? styles.networkBorder : undefined}
                >
                  <View className="flex-1 flex-row items-center gap-4">
                    <View className="h-4 w-4 items-center justify-center rounded-full bg-brand-light">
                      <View className="h-2 w-2 rounded-full bg-brand-primary" />
                    </View>
                    <View className="flex-1 flex-row items-center gap-2.5 px-3">
                      <Text className="text-base text-text-primary">{network.name}</Text>
                      <Text className="flex-1 text-right text-base text-text-secondary">
                        {network.address}
                      </Text>
                    </View>
                    <View className="h-4 w-4 items-center justify-center">
                      <Icon name="ChevronRight" size={16} />
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Your Accounts Section */}
        <View className="px-5 mt-6">
          <Text className="mb-4 text-lg font-semibold text-text-primary">Your Accounts</Text>
          <View className="gap-2 pb-2">
            {accounts.map((account, index) => {
              const isSelected = currentAccount?.address === account.address;
              return (
                <TouchableOpacity
                  key={account.address}
                  onPress={() => handleAccountPress(account)}
                  className={`flex-row items-center justify-between rounded-xl px-4 py-4 ${
                    isSelected
                      ? 'bg-brand-primary/20 border border-brand-primary'
                      : 'bg-background-secondary/60'
                  }`}
                >
                  <View className="flex-row items-center gap-4">
                    <Image
                      source={DefaultIcon}
                      className="h-10 w-10 rounded-full"
                      resizeMode="cover"
                    />
                    <View>
                      <Text
                        className={`text-lg ${
                          isSelected ? 'text-brand-primary font-semibold' : 'text-text-primary'
                        }`}
                      >
                        {account.alianName || `Account ${index + 1}`}
                      </Text>
                      <Text className="text-sm text-text-secondary">
                        {formatAddress(account.address)}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleEditAccount(account)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    className="h-8 w-8 items-center justify-center"
                  >
                    <Icon name="Edit2" size={20} />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Add Account Button - Fixed at bottom */}
        <View className="mt-6 px-6 pb-6">
          <TouchableOpacity
            onPress={handleAddAccount}
            className="flex-row items-center justify-center rounded-xl bg-brand-primary px-6 py-4"
          >
            <Text className="text-lg font-medium text-button-primary-text">Add Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </BottomSheetView>
  );
};

const styles = {
  networkBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#373B43',
  },
};

export default AccountListScreen;
