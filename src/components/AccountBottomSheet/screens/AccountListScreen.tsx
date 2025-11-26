import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { NetworkLogos } from '@/assets';
import DefaultIcon from '@/assets/common/icon.png';
import { Button } from '@/components';
import { Icon } from '@/components/Icon';
import { walletController } from '@/core/controllers/WalletController';
import type { NetworkId } from '@/stores/networkStore';
import { useNetworkStore } from '@/stores/networkStore';
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
  type?: string;
  brandName?: string;
  aliasName?: string;
}

interface Network {
  id: NetworkId;
  name: string;
  address: string;
  logo: any;
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
  const { selectedNetworks, toggleNetwork, isNetworkSelected, isAllSelected, selectAllNetworks } =
    useNetworkStore();

  // Format address for display
  const formattedAddress = currentAccount?.address
    ? `${currentAccount.address.slice(0, 6)}...${currentAccount.address.slice(-4)}`
    : '0x0000...0000';

  const networks: Network[] = [
    {
      id: 'hyperliquid',
      name: 'Hyperliquid',
      address: formattedAddress,
      logo: NetworkLogos.hyperliquid,
    },
    {
      id: 'ethereum',
      name: 'Ethereum',
      address: formattedAddress,
      logo: NetworkLogos.ethereum,
    },
    {
      id: 'arbitrum',
      name: 'Arbitrum',
      address: formattedAddress,
      logo: NetworkLogos.arbitrum,
    },
    {
      id: 'base',
      name: 'Base',
      address: formattedAddress,
      logo: NetworkLogos.base,
    },
  ];

  useFocusEffect(
    React.useCallback(() => {
      loadAccounts();
    }, []),
  );

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
    onAddAccount?.();
    try {
      navigation.navigate('AddAccount');
    } catch (error) {
      console.log('Navigation to AddAccount failed:', error);
      onAddAccount?.();
    }
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

  console.log({ 123: currentAccount?.address, accounts });

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
        {/* Your Accounts Section */}
        <View className="mb-6">
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
                    <Icon name="Edit2" size={16} />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Networks Section */}
        <View className="rounded-2xl bg-background-secondary/60 px-5 py-4">
          {/* Select All Option */}
          <TouchableOpacity
            className="flex-row items-center justify-between py-4 border-b border-gray-700"
            onPress={selectAllNetworks}
          >
            <View className="flex-1 flex-row items-center gap-4">
              <View className="w-6 h-6 items-center justify-center">
                <Icon name="Globe" size={16} />
              </View>
              <View className="flex-1 flex-row items-center gap-2.5 px-3">
                <Text className="text-base font-semibold text-text-primary">All Networks</Text>
              </View>
              <View
                className={`h-5 w-5 items-center justify-center rounded ${
                  isAllSelected() ? 'bg-brand-primary' : 'border-2 border-gray-600'
                }`}
              >
                {isAllSelected() && <Icon name="Check" size={14} color="#fff" />}
              </View>
            </View>
          </TouchableOpacity>

          {/* Individual Networks */}
          {networks.map((network, index) => {
            const isSelected = isNetworkSelected(network.id);
            return (
              <View key={network.id}>
                <TouchableOpacity
                  className={`flex-row items-center justify-between py-4 ${
                    index < networks.length - 1 ? 'border-b border-gray-700' : ''
                  }`}
                  onPress={() => toggleNetwork(network.id)}
                >
                  <View className="flex-1 flex-row items-center gap-4">
                    <Image source={network.logo} className="w-6 h-6" resizeMode="contain" />
                    <View className="flex-1 flex-row items-center gap-2.5 px-3">
                      <Text className="text-base text-text-primary">{network.name}</Text>
                      <Text className="flex-1 text-right text-base text-text-secondary">
                        {network.address}
                      </Text>
                    </View>
                    <View
                      className={`h-5 w-5 items-center justify-center rounded ${
                        isSelected ? 'bg-brand-primary' : 'border-2 border-gray-600'
                      }`}
                    >
                      {isSelected && <Icon name="Check" size={14} color="#fff" />}
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </BottomSheetScrollView>
    </BaseScreen>
  );
};

export default AccountListScreen;
