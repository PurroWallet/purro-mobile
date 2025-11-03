import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import Clipboard from '@react-native-clipboard/clipboard';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import DefaultIcon from '@/assets/common/icon.png';
import { Icon } from '@/components/Icon';
import { walletController } from '@/core/controllers/WalletController';
import { useTranslation } from '@/utils/i18n';
import type { AccountStackParamList } from '../AccountStackNavigator';
import BaseScreen from '../components/BaseScreen';

const EditAccountScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AccountStackParamList, 'EditAccount'>>();
  const route = useRoute<RouteProp<AccountStackParamList, 'EditAccount'>>();
  const { accountAddress } = route.params;
  const [account, setAccount] = useState<any>(null);
  const { t } = useTranslation();

  const loadAccount = useCallback(async () => {
    try {
      const accounts = await walletController.getAllAccounts();
      const foundAccount = accounts.find((acc: any) => acc.address === accountAddress);
      setAccount(foundAccount);
    } catch (error) {
      // Handle error silently
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
          Alert.alert(t('accountBottomSheet.alerts.privateKeyTitle'), privateKey, [
            {
              text: t('accountBottomSheet.alerts.copy'),
              onPress: () => Clipboard.setString(privateKey),
            },
            { text: t('common.cancel'), style: 'cancel' },
          ]);
        } catch {
          Alert.alert(
            t('errors.generic.title'),
            t('accountBottomSheet.errors.exportPrivateKeyFailed'),
          );
        }
      },
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('accountBottomSheet.deleteAccount'),
      t('accountBottomSheet.deleteAccountConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('accountBottomSheet.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await walletController.removeAccount(accountAddress);
              navigation.goBack();
            } catch (error) {
              Alert.alert(
                t('errors.generic.title'),
                t('accountBottomSheet.errors.deleteAccountFailed'),
              );
            }
          },
        },
      ],
    );
  };

  if (!account) {
    return (
      <View className="flex-1 items-center justify-center bg-primary">
        <Text className="text-text-primary">{t('common.loading')}</Text>
      </View>
    );
  }

  const renderFooter = () => (
    <View className="absolute bottom-10 w-full px-6">
      <TouchableOpacity
        onPress={handleDeleteAccount}
        className="flex-row items-center justify-center gap-2 rounded-xl bg-background-secondary py-4"
      >
        <Icon name="Trash2" size={20} color="rgb(var(--color-system-error))" />
        <Text className="text-base font-medium text-system-error">
          {t('accountBottomSheet.delete')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <BaseScreen
      title={t('accountBottomSheet.editAccount')}
      showBackButton={true}
      onBack={handleBack}
      isScrollable={true}
      footer={renderFooter()}
    >
      <BottomSheetScrollView
        className="w-full px-5"
        contentContainerStyle={{
          paddingBottom: 80,
        }}
      >
        {/* Account Avatar */}
        <View className="mt-6 items-center justify-center gap-4">
          <Image source={DefaultIcon} className="w-32 h-32 rounded-full" resizeMode="cover" />
        </View>

        {/* Options List */}
        <View className="mt-6 gap-2">
          <TouchableOpacity
            onPress={handleEditName}
            className="flex-row items-center justify-between rounded-xl bg-background-secondary px-4 py-4"
          >
            <View className="flex-1 flex-row items-center gap-2 pr-4">
              <Text className="text-lg text-text-primary">
                {t('accountBottomSheet.accountName')}
              </Text>
              <Text className="flex-1 text-right text-lg text-text-secondary">
                {account.alianName || 'Unnamed'}
              </Text>
            </View>
            <Icon name="ChevronRight" size={20} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShowPrivateKey}
            className="flex-row items-center justify-between rounded-xl bg-background-secondary px-4 py-4"
          >
            <View className="flex-1 flex-row items-center gap-2 pr-4">
              <Text className="text-lg text-text-primary">
                {t('accountBottomSheet.showPrivateKey')}
              </Text>
            </View>
            <Icon name="ChevronRight" size={20} />
          </TouchableOpacity>
        </View>
      </BottomSheetScrollView>
    </BaseScreen>
  );
};

export default EditAccountScreen;
