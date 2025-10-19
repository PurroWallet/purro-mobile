import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, Image } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { ChevronRight, Trash2 } from 'lucide-react-native';
import { walletController } from '@/core/controllers/WalletController';
import Clipboard from '@react-native-clipboard/clipboard';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AccountStackParamList } from '../AccountStackNavigator';
import DefaultIcon from '@/assets/common/icon.png';
import SheetHeader from '../components/SheetHeader';

type Props = NativeStackScreenProps<AccountStackParamList, 'EditAccount'>;

const EditAccountScreen: React.FC<Props> = ({ navigation, route }) => {
  const { accountAddress } = route.params;
  const [account, setAccount] = useState<any>(null);

  const loadAccount = useCallback(async () => {
    try {
      const accounts = await walletController.getAllAccounts();
      const foundAccount = accounts.find(
        (acc: any) => acc.address === accountAddress,
      );
      setAccount(foundAccount);
    } catch (error) {
      console.error('Failed to load account:', error);
    }
  }, [accountAddress]);

  useEffect(() => {
    loadAccount();
  }, [loadAccount]);

  const handleEditName = () => {
    navigation.navigate('EditAccountName', {
      accountAddress,
      currentName: account?.alianName || '',
    });
  };

  const handleShowPrivateKey = () => {
    // Navigate to password verification screen
    navigation.navigate('PasswordVerification', {
      accountAddress,
      onSuccess: async () => {
        try {
          const privateKey = await walletController.exportAccount(accountAddress);
          Alert.alert('Private Key', privateKey, [
            { text: 'Copy', onPress: () => Clipboard.setString(privateKey) },
            { text: 'Close', style: 'cancel' },
          ]);
        } catch {
          Alert.alert('Error', 'Failed to export private key');
        }
      },
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete this account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await walletController.removeAccount(accountAddress);
              navigation.goBack();
            } catch (error) {
              console.error('Failed to delete account:', error);
              Alert.alert('Error', 'Failed to delete account');
            }
          },
        },
      ],
    );
  };

  if (!account) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-[#F9F9F9]">Loading...</Text>
      </View>
    );
  }

  return (
    <BottomSheetScrollView className="flex-1 bg-[#161616]">
      {/* Header */}
      <SheetHeader
        title="Edit Account"
        onBack={handleBack}
      />
      <View className="mb-6" />

      {/* Account Avatar */}
      <View className="mt-6 items-center justify-center gap-4">
        <Image source={DefaultIcon} className="w-12 h-12" resizeMode="cover" />
      </View>

      {/* Options List */}
      <View className="mt-6 gap-2 px-6">
        <TouchableOpacity
          onPress={handleEditName}
          className="flex-row items-center justify-between rounded-xl bg-background-secondary px-4 py-4"
        >
          <View className="flex-1 flex-row items-center gap-2 pr-4">
            <Text className="text-lg text-text-primary">Account Name</Text>
            <Text className="flex-1 text-right text-lg text-text-secondary">
              {account.alianName || 'Unnamed'}
            </Text>
          </View>
          <ChevronRight size={20} color="rgb(var(--color-text-primary))" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleShowPrivateKey}
          className="flex-row items-center justify-between rounded-xl bg-background-secondary px-4 py-4"
        >
          <View className="flex-1 flex-row items-center gap-2 pr-4">
            <Text className="text-lg text-text-primary">Show Private Key</Text>
          </View>
          <ChevronRight size={20} color="rgb(var(--color-text-primary))" />
        </TouchableOpacity>

      </View>

      {/* Delete Button */}
      <View className="mt-8 mb-10 px-6">
        <TouchableOpacity
          onPress={handleDeleteAccount}
          className="flex-row items-center justify-center gap-2 rounded-xl bg-background-secondary py-4"
        >
          <Trash2 size={20} color="rgb(var(--color-system-error))" />
          <Text className="text-base font-medium text-system-error">
            Delete Account
          </Text>
        </TouchableOpacity>
      </View>
    </BottomSheetScrollView>
  );
};

export default EditAccountScreen;
