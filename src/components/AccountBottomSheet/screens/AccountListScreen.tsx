import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import DefaultIcon from '@/assets/common/icon.png';
import { Button } from '@/components';
import { Icon } from '@/components/Icon';
import { walletController } from '@/core/controllers/WalletController';
import { formatAddress } from '@/utils/address';
import type { AccountStackParamList } from '../AccountStackNavigator';
import BaseScreen from '../components/BaseScreen';

type Props = {
  onClose: () => void;
  currentAccount: any;
  onAccountSelect: (account: any) => void;
  onAddAccount?: () => void;
  onSettings?: () => void;
};

interface Account {
  address: string;
  type: string;
  brandName: string;
  aliasName?: string;
}

interface Network {
  id: string;
  name: string;
  address: string;
  icon: string;
}

const AccountListScreen: React.FC<Props> = ({
  onClose,
  currentAccount,
  onAccountSelect,
  onAddAccount,
  onSettings,
}) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AccountStackParamList, 'AccountList'>>();
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
      console.log('📝 AccountListScreen: Loading accounts...');
      const accountsList = await walletController.getAllAccounts();
      console.log('✅ AccountListScreen: Loaded', accountsList.length, 'accounts');
      setAccounts(accountsList);
    } catch (error) {
      console.error('❌ Failed to load accounts:', error);
    }
  };

  const handleAccountPress = (account: Account) => {
    onAccountSelect(account);
    onClose();
  };

  const handleAddAccount = () => {
    // Call the callback if provided
    onAddAccount?.();
    console.log('📝 AccountListScreen: Navigating to AddAccount with current account...');
    console.log(
      '📍 Current account:',
      currentAccount?.aliasName ||
        currentAccount?.address?.substring(0, 10) + '...' ||
        'No current account',
    );

    // Navigate to AddAccount screen with current account context
    navigation.navigate('AddAccount', {
      currentAccount,
      onNewAccountCreated: (newAccount) => {
        console.log('📝 AccountListScreen: New account created callback');
        console.log(
          '📍 New account to set as current:',
          newAccount.address.substring(0, 10) + '...',
        );

        // Set the new account as current
        onAccountSelect(newAccount);

        // Reload accounts to show the new one with longer delay for persistence
        setTimeout(() => {
          console.log('📝 AccountListScreen: Reloading accounts after new account creation...');
          loadAccounts();
        }, 500); // Increased delay to ensure persistence is complete
      },
    });
  };

  const handleEditAccount = (account: Account) => {
    navigation.navigate('EditAccount', { accountAddress: account.address });
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  // Add Account Button Footer
  const renderFooter = () => (
    <View className="absolute bottom-3 left-0 right-0 px-6 pt-3 pb-6">
      <Button
        type="primary"
        title="Add Account"
        onPress={handleAddAccount}
        className="bg-teal-600"
      />
    </View>
  );

  return (
    <BaseScreen
      showAccountInfo={true}
      currentAccountName={currentAccount?.aliasName || 'Account 1'}
      currentAccountAddress={currentAccount?.address || ''}
      onSettings={handleSettings}
      footer={renderFooter()}
      isScrollable={true}
      contentContainerStyle={{
        paddingHorizontal: 20,
      }}
    >
      <BottomSheetScrollView className="w-full" contentContainerClassName="pb-5">
        {/* Networks Section */}
        <View className="rounded-2xl bg-background-secondary/60 px-5 py-4">
          {networks.map((network, index) => (
            <View key={network.id}>
              <TouchableOpacity
                className={`flex-row items-center justify-between py-4 ${
                  index < networks.length - 1 ? 'border-b border-gray-700' : ''
                }`}
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

        {/* Your Accounts Section */}
        <View className="mt-6">
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
                        {account.aliasName || `Account ${index + 1}`}
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
      </BottomSheetScrollView>
    </BaseScreen>
  );
};

export default AccountListScreen;
