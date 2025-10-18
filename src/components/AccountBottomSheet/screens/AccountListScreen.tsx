import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';
import { walletController } from '@/core/controllers/WalletController';
import { Settings, ChevronRight, Edit2 } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AccountStackParamList } from '../AccountStackNavigator';
import type { NavigationProp } from '@react-navigation/native';
import DefaultIcon from '@/assets/common/icon.png';

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

  useEffect(() => {
    // Reload when currentAccount changes
  }, [currentAccount]);

  const loadAccounts = async () => {
    try {
      console.log('📋 AccountListScreen - Loading accounts...');
      const accountsList = await walletController.getAllAccounts();
      console.log(
        '📋 AccountListScreen - Loaded accounts:',
        JSON.stringify(accountsList, null, 2),
      );
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
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4,
    )}`;
  };

  const currentAccountName = currentAccount?.alianName || 'Account 1';
  const currentAccountAddress = currentAccount?.address || '';

  return (
    <BottomSheetView className="flex-1 bg-[#161616]">
      {/* Header - Avatar + Current Account + Settings Icon */}
      <View className="flex-row items-center justify-between px-6 py-6">
        <View className="flex-row items-center gap-2.5">
          <Image
            source={DefaultIcon}
            className="h-12 w-12 rounded-full"
            resizeMode="cover"
          />
          <View>
            <Text className="text-xl font-semibold text-[#F9F9F9]">
              {currentAccountName}
            </Text>
            <Text className="text-sm text-[#8D94A3]">
              {formatAddress(currentAccountAddress)}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleSettings}
          className="h-6 w-6 items-center justify-center"
        >
          <Settings size={24} color="#F9F9F9" />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView className="flex-1 px-5">
        {/* Networks Section */}
        <View className="rounded-2xl bg-[#25272C]/60 px-5 py-0">
          {networks.map((network, index) => (
            <View key={network.id}>
              <TouchableOpacity
                className="flex-row items-center justify-between py-4"
                style={
                  index < networks.length - 1 ? styles.networkBorder : undefined
                }
              >
                <View className="flex-1 flex-row items-center gap-4">
                  <View className="h-4 w-4 items-center justify-center rounded-full bg-[#97FCE4]">
                    <View className="h-2 w-2 rounded-full bg-[#97FCE4]" />
                  </View>
                  <View className="flex-1 flex-row items-center gap-2.5 px-3">
                    <Text className="text-base text-[#F9F9F9]">
                      {network.name}
                    </Text>
                    <Text className="flex-1 text-right text-base text-[#8D94A3]">
                      {network.address}
                    </Text>
                  </View>
                  <View className="h-4 w-4 items-center justify-center">
                    <ChevronRight size={16} color="#FFFFFF" />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Your Accounts Section */}
        <View className="mt-6 pb-2">
          <Text className="mb-4 text-lg font-semibold text-[#F9F9F9]">
            Your Accounts
          </Text>
          <View className="gap-2">
            {accounts.map((account, index) => {
              const isSelected = currentAccount?.address === account.address;
              return (
                <TouchableOpacity
                  key={account.address}
                  onPress={() => handleAccountPress(account)}
                  className={`flex-row items-center justify-between rounded-xl px-4 py-4 ${
                    isSelected
                      ? 'bg-[#059288]/20 border border-[#059288]'
                      : 'bg-[#25272C]/60'
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
                          isSelected
                            ? 'text-[#059288] font-semibold'
                            : 'text-[#F9F9F9]'
                        }`}
                      >
                        {account.alianName || `Account ${index + 1}`}
                      </Text>
                      <Text className="text-sm text-[#8D94A3]">
                        {formatAddress(account.address)}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleEditAccount(account)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    className="h-8 w-8 items-center justify-center"
                  >
                    <Edit2 size={20} color="#F9F9F9" />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Add Account Button - Fixed at bottom */}
      <View className="absolute bottom-10 w-full px-6">
        <TouchableOpacity
          onPress={handleAddAccount}
          className="flex-row items-center justify-center rounded-xl bg-[#059288] px-6 py-4"
        >
          <Text className="text-lg font-medium text-[#F9F9F9]">
            Add Account
          </Text>
        </TouchableOpacity>
      </View>
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
