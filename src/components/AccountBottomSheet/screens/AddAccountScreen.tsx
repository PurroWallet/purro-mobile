import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { walletController } from '@/core/controllers/WalletController';
import { generateMnemonic } from '@/core/keyring';
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
  disabled?: boolean;
}

const AddAccountScreen: React.FC<Props> = ({ onClose: _onClose }) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AccountStackParamList, 'AddAccount'>>();
  const { t } = useTranslation();

  const [loading, setLoading] = React.useState(false);

  const handleCreateNew = async () => {
    setLoading(true);
    try {
      // Check if HD wallets exist
      const hdKeyrings = await walletController.getHDKeyrings();

      if (hdKeyrings.length === 0) {
        // No HD wallets exist, generate new seed phrase
        const mnemonic = generateMnemonic();

        // Navigate to seed phrase display
        navigation.navigate('SeedPhraseDisplay', { mnemonic });
      } else {
        // HD wallets exist, show select screen
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
      }
    } catch (error) {
      console.error('AddAccount: Error checking HD wallets:', error);
      Alert.alert('Error', 'Failed to check existing wallets');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
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
      disabled: loading,
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
              disabled={option.disabled}
              className={`flex-row items-center gap-3.5 rounded-xl bg-background-secondary/60 px-4 py-4 ${
                option.disabled ? 'opacity-50' : ''
              }`}
            >
              <View className="h-9 w-9 items-center justify-center rounded-full bg-brand-secondary">
                <Icon name={option.icon} size={24} />
              </View>
              <View className="flex-1">
                <Text className="text-lg text-text-primary">{t(option.title)}</Text>
                <Text className="text-sm text-text-secondary">{t(option.subtitle)}</Text>
              </View>
              {option.disabled && (
                <View className="h-5 w-5 items-center justify-center rounded-full bg-brand-primary">
                  <View className="h-3 w-3 animate-spin rounded-full border-2 border-system-white border-t-transparent" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheetScrollView>
    </BaseScreen>
  );
};

export default AddAccountScreen;
