import { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import Clipboard from '@react-native-clipboard/clipboard';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '@/components';
import { walletController } from '@/core/controllers/WalletController';
import { useTranslation } from '@/utils/i18n';
import type { AccountStackParamList } from '../AccountStackNavigator';
import BaseScreen from '../components/BaseScreen';

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
          Alert.alert(t('errors.generic.title'), t('accountBottomSheet.errors.noAccountsFound'));
          onClose();
          return;
        }

        const mnemonic = await walletController.exportMnemonic();
        setSeedPhrase(mnemonic || '');
      } catch (error) {
        Alert.alert(t('errors.generic.title'), t('accountBottomSheet.errors.loadSeedPhraseFailed'));
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

  const renderFooter = () => (
    <View className="absolute bottom-10 w-full px-6">
      <Button
        type="secondary"
        title={t('accountBottomSheet.securedRecoveryPhrase')}
        onPress={() => navigation.goBack()}
        className="w-full"
      />
    </View>
  );

  return (
    <BaseScreen
      title={t('accountBottomSheet.backupWallet')}
      showBackButton={true}
      onBack={() => navigation.goBack()}
      footer={renderFooter()}
      isScrollable={true}
    >
      <BottomSheetScrollView className="w-full px-5" contentContainerClassName="pb-10">
        <View className="py-2">
          <Text className="text-lg text-[#F9F9F9] mb-2">
            {t('accountBottomSheet.recoveryPhraseTitle')}
          </Text>
          <Text className="text-sm text-[#8D94A3] mb-6">
            {t('accountBottomSheet.recoveryPhraseDescription')}
          </Text>

          <View className="mb-6 rounded-xl bg-[#373B43]/60 p-4">
            {!isRevealed ? (
              <TouchableOpacity onPress={handleReveal} className="items-center justify-center py-8">
                <Text className="text-lg text-[#059288] font-medium">
                  {t('accountBottomSheet.revealRecoveryPhrase')}
                </Text>
              </TouchableOpacity>
            ) : (
              <View>
                <Text className="text-base text-[#F9F9F9] leading-6 mb-4">{seedPhrase}</Text>
                <Button
                  type="primary"
                  title={t('accountBottomSheet.copyToClipboard')}
                  onPress={handleCopyToClipboard}
                  className="self-center"
                  textClassName="text-sm"
                />
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
      </BottomSheetScrollView>
    </BaseScreen>
  );
};

export default SeedPhraseBackupScreen;
