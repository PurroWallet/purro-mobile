import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import Clipboard from '@react-native-clipboard/clipboard';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AccountStackParamList } from '../AccountStackNavigator';
import SheetHeader from '../components/SheetHeader';
import { walletController } from '@/core/controllers/WalletController';
import { useTranslation } from '@/utils/i18n';

type Props = NativeStackScreenProps<AccountStackParamList, 'SeedPhraseBackup'> & {
  onClose: () => void;
};

const SeedPhraseBackupScreen: React.FC<Props> = ({ navigation, onClose }) => {
  const [seedPhrase, setSeedPhrase] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const { t } = useTranslation();

  useEffect(() => {
    const loadSeedPhrase = async () => {
      try {
        setIsLoading(true);
        const accounts = await walletController.getAllAccounts();
        if (accounts.length === 0) {
          Alert.alert(
            t('errors.generic.title'),
            t('accountBottomSheet.errors.noAccountsFound'),
          );
          onClose();
          return;
        }

        const mnemonic = await walletController.exportMnemonic();
        setSeedPhrase(mnemonic || '');
      } catch (error) {
        console.error('Error loading seed phrase:', error);
        Alert.alert(
          t('errors.generic.title'),
          t('accountBottomSheet.errors.loadSeedPhraseFailed'),
        );
        onClose();
      } finally {
        setIsLoading(false);
      }
    };

    loadSeedPhrase();
  }, [onClose, t]);

  const handleCopyToClipboard = () => {
    Clipboard.setString(seedPhrase);
    Alert.alert(
      t('accountBottomSheet.alerts.copiedTitle'),
      t('accountBottomSheet.alerts.seedPhraseCopied'),
    );
  };

  const handleReveal = () => {
    setIsRevealed(true);
  };

  if (isLoading) {
    return (
      <BottomSheetView className="flex-1 items-center justify-center">
        <Text className="text-lg text-[#F9F9F9]">{t('common.loading')}</Text>
      </BottomSheetView>
    );
  }

  return (
    <BottomSheetView className="flex-1">
      {/* Header */}
      <SheetHeader
        title={t('accountBottomSheet.backupWallet')}
        onBack={() => navigation.goBack()}
      />
      <View className="mb-4" />

      <ScrollView className="flex-1 px-5">
        <View className="py-2">
          <Text className="text-lg text-[#F9F9F9] mb-2">
            {t('accountBottomSheet.recoveryPhraseTitle')}
          </Text>
          <Text className="text-sm text-[#8D94A3] mb-6">
            {t('accountBottomSheet.recoveryPhraseDescription')}
          </Text>

          <View className="mb-6 rounded-xl bg-[#373B43]/60 p-4">
            {!isRevealed ? (
              <TouchableOpacity
                onPress={handleReveal}
                className="items-center justify-center py-8"
              >
                <Text className="text-lg text-[#059288] font-medium">
                  {t('accountBottomSheet.revealRecoveryPhrase')}
                </Text>
              </TouchableOpacity>
            ) : (
              <View>
                <Text className="text-base text-[#F9F9F9] leading-6 mb-4">
                  {seedPhrase}
                </Text>
                <TouchableOpacity
                  onPress={handleCopyToClipboard}
                  className="self-center rounded-lg bg-[#059288] px-4 py-2"
                >
                  <Text className="text-sm text-[#F9F9F9] font-medium">
                    {t('accountBottomSheet.copyToClipboard')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View className="rounded-xl bg-[rgba(255,107,107,0.1)] p-4">
            <Text className="mb-2 text-sm font-semibold text-[#FF6B6B]">
              {t('accountBottomSheet.securityNotesTitle')}
            </Text>
            <Text className="text-sm leading-5 text-[#8D94A3]">
              {t('accountBottomSheet.securityNotesDescription')}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View className="px-5 pb-6">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-full min-h-12 items-center justify-center rounded-xl bg-[#25272C]/60 px-6 py-4"
        >
          <Text className="text-base font-medium text-[#F9F9F9]">
            {t('accountBottomSheet.securedRecoveryPhrase')}
          </Text>
        </TouchableOpacity>
      </View>
    </BottomSheetView>
  );
};

export default SeedPhraseBackupScreen;