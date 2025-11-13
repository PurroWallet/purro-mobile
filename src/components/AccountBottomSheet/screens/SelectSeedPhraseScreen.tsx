import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '@/components/Button';
import { walletService } from '@/core/services';
import { useTranslation } from '@/utils/i18n';
import type { AccountStackParamList } from '../AccountStackNavigator';
import BaseScreen from '../components/BaseScreen';

interface HDKeyringInfo {
  id: string;
  accountCount: number;
  accounts: Array<{ address: string; index: number }>;
}

type Props = {
  mode?: 'create' | 'backup';
  onSeedPhraseSelected?: (keyringInfo: HDKeyringInfo) => void;
};

const SelectSeedPhraseScreen: React.FC<Props> = ({ mode = 'backup', onSeedPhraseSelected }) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AccountStackParamList, 'SelectSeedPhrase'>>();
  const { t } = useTranslation();
  const [hdKeyrings, setHdKeyrings] = useState<HDKeyringInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKeyring, setSelectedKeyring] = useState<HDKeyringInfo | null>(null);

  useEffect(() => {
    loadHDKeyrings();
  }, []);

  const loadHDKeyrings = async () => {
    try {
      const keyrings = await walletService.getHDKeyringsWithAccounts();
      setHdKeyrings(keyrings);

      if (keyrings.length > 0) {
        setSelectedKeyring(keyrings[0]);
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('accountBottomSheet.loadSeedPhraseFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectKeyring = (keyring: HDKeyringInfo) => {
    setSelectedKeyring(keyring);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = async () => {
    if (!selectedKeyring) {
      Alert.alert(t('common.required'), t('accountBottomSheet.selectSeedPhraseRequired'));
      return;
    }

    if (mode === 'backup') {
      // Extract keyring index from ID (e.g., "seed_1" -> 0)
      const keyringIndex = parseInt(selectedKeyring.id.split('_')[1]) - 1;

      // Require password verification before showing seed phrase backup
      navigation.navigate('PasswordVerification', {
        accountAddress: '',
        onSuccess: async (verifiedPassword) => {
          try {
            // Ensure keyring service is booted with verified password before export
            const { walletService } = await import('@/core/services/WalletService');
            await walletService.unlockWallet(verifiedPassword);

            // Password verified, navigate to seed phrase backup
            navigation.navigate('SeedPhraseBackup', {
              selectedKeyringIndex: keyringIndex,
            });
          } catch (error) {
            console.error('🔐 SelectSeedPhrase: Error during backup flow:', error);
            Alert.alert(
              t('common.error'),
              t('accountBottomSheet.errors.backupWalletFailed') || 'Failed to access backup',
            );
          }
        },
      });
    } else if (mode === 'create' && onSeedPhraseSelected) {
      // Pass the selected keyring to the callback
      // Navigation is handled by the callback to prevent race conditions
      onSeedPhraseSelected(selectedKeyring);
    }
  };

  const renderFooter = () => (
    <View className="absolute bottom-10 w-full px-6">
      <Button
        type="primary"
        title={
          mode === 'backup'
            ? t('accountBottomSheet.viewSeedPhrase')
            : t('accountBottomSheet.selectSeedPhraseButton')
        }
        onPress={handleNext}
        disabled={!selectedKeyring}
      />
    </View>
  );

  return (
    <BaseScreen
      title={
        mode === 'backup'
          ? t('accountBottomSheet.backupSeedPhrase')
          : t('accountBottomSheet.selectSeedPhrase')
      }
      showBackButton={true}
      onBack={handleBack}
      footer={renderFooter()}
      isScrollable={true}
    >
      <View className="flex-1 gap-6">
        <View className="items-center gap-4">
          <Text className="w-[335px] text-center text-h4 text-text-primary">
            {mode === 'backup'
              ? t('accountBottomSheet.selectSeedPhraseToBackup')
              : t('accountBottomSheet.selectSeedPhraseForAccount')}
          </Text>
          <Text className="w-[335px] text-center text-button text-text-secondary">
            {mode === 'backup'
              ? t('accountBottomSheet.chooseSeedPhraseToBackup')
              : t('accountBottomSheet.chooseSeedPhraseForAccount')}
          </Text>
        </View>

        {loading ? (
          <Text className="text-center text-text-secondary">
            {t('accountBottomSheet.loadingSeedPhrases')}
          </Text>
        ) : hdKeyrings.length === 0 ? (
          <View className="items-center gap-4">
            <Text className="text-center text-text-secondary">
              {t('accountBottomSheet.noSeedPhrasesFound')}
            </Text>
            <Text className="text-center text-sm text-text-tertiary">
              {t('accountBottomSheet.createFirstSeedPhrase')}
            </Text>
          </View>
        ) : (
          <ScrollView className="flex-1">
            <View className="gap-3 px-6">
              {hdKeyrings.map((keyring, index) => (
                <TouchableOpacity
                  key={keyring.id}
                  className={`p-4 rounded-lg border ${
                    selectedKeyring?.id === keyring.id
                      ? 'border-brand-primary bg-[rgba(0,122,255,0.1)]'
                      : 'border-border bg-background-secondary'
                  }`}
                  onPress={() => handleSelectKeyring(keyring)}
                >
                  <Text className="font-medium text-text-primary">
                    {t('accountBottomSheet.seedPhrase')} {index + 1}
                  </Text>
                  <Text className="text-sm text-text-secondary mt-1">
                    {keyring.accountCount}{' '}
                    {keyring.accountCount === 1
                      ? t('accountBottomSheet.account')
                      : t('accountBottomSheet.account_plural')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </BaseScreen>
  );
};

export default SelectSeedPhraseScreen;
