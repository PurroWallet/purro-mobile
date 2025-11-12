import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { walletController } from '@/core/controllers/WalletController';
import { useTranslation } from '@/utils/i18n';
import type { AccountStackParamList } from '../AccountStackNavigator';
import BaseScreen from '../components/BaseScreen';

type Props = {
  onClose: () => void;
};

interface AccountOption {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  action: () => void;
}

const AddAccountScreen: React.FC<Props> = ({ onClose: _onClose }) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AccountStackParamList, 'AddAccount'>>();
  const { t } = useTranslation();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCreateNew = () => {
    // Navigate to select seed phrase screen to choose which HD keyring to add account to
    navigation.navigate('SelectSeedPhrase', {
      mode: 'create',
      onSeedPhraseSelected: async (keyringInfo) => {
        // Extract keyring index from ID (e.g., "seed_1" -> 0)
        const keyringIndex = parseInt(keyringInfo.id.split('_')[1]) - 1;

        // Navigate to password verification screen first
        navigation.navigate('PasswordVerification', {
          accountAddress: '',
          onSuccess: async (verifiedPassword) => {
            try {
              // Add account to the selected HD keyring
              const newAddress = await walletController.addAccountToHDKeyring(keyringIndex);

              // Navigate to success screen
              navigation.navigate('Success', {
                title: 'Account Created!',
                message: `New account has been created successfully using ${keyringInfo.id.replace('_', ' ').toUpperCase()}.`,
                buttonText: 'Done',
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to create new account');
            }
          },
        });
      },
    });
  };

  const handleImportSeedPhrase = () => {
    navigation.navigate('ImportSeedPhrase');
  };

  const handleImportPrivateKey = () => {
    navigation.navigate('ImportPrivateKey');
  };

  const options: AccountOption[] = [
    {
      id: 'create',
      title: 'accountBottomSheet.createNewAccount',
      subtitle: 'accountBottomSheet.createAccountDescription',
      icon: 'PlusCircle',
      action: handleCreateNew,
    },
    {
      id: 'import-seed',
      title: 'accountBottomSheet.importRecoveryPhrase',
      subtitle: 'accountBottomSheet.importRecoveryPhraseDescription',
      icon: 'FileText',
      action: handleImportSeedPhrase,
    },
    {
      id: 'import-key',
      title: 'accountBottomSheet.importPrivateKey',
      subtitle: 'accountBottomSheet.importPrivateKeyDescription',
      icon: 'Key',
      action: handleImportPrivateKey,
    },
  ];

  return (
    <BaseScreen
      title={t('accountBottomSheet.addAccount')}
      showBackButton={true}
      onBack={handleBack}
      isScrollable={true}
      contentContainerStyle={{
        paddingHorizontal: 20,
      }}
    >
      <BottomSheetScrollView
        style={{ width: '100%' }}
        contentContainerStyle={{
          paddingBottom: 20,
        }}
      >
        {/* Options List */}
        <View className="gap-2">
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              onPress={option.action}
              className="flex-row items-center gap-3.5 rounded-xl bg-background-secondary/60 px-4 py-4"
            >
              <View className="h-9 w-9 items-center justify-center rounded-full bg-brand-secondary">
                <Icon name={option.icon} size={24} />
              </View>
              <View className="flex-1">
                <Text className="text-lg text-text-primary">{t(option.title)}</Text>
                <Text className="text-sm text-text-secondary">{t(option.subtitle)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheetScrollView>
    </BaseScreen>
  );
};

export default AddAccountScreen;
