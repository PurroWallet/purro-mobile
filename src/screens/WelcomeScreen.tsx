import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Pressable,
  Alert,
} from 'react-native';
import { useTranslation } from '@/utils/i18n';
import { useCreateWallet } from '@/hooks/wallet/useCreateWallet';
import type { WelcomeScreenProps } from '@/types/navigation';

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const { getSeedPhrase } = useCreateWallet();

  const handleCreateWallet = async () => {
    if (!acceptedTerms) {
      Alert.alert(
        t('welcome.termsRequired.title'),
        t('welcome.termsRequired.message'),
        [{ text: t('welcome.termsRequired.ok'), style: 'default' }],
      );
      return;
    }

    try {
      const { mnemonic } = await getSeedPhrase();

      navigation.navigate('SeedPhraseDisplay', { mnemonic });
    } catch (error) {
      console.error('Error creating wallet:', error);
      Alert.alert(t('errors.generic.title'), t('errors.wallet.createFailed'), [
        { text: t('common.ok'), style: 'default' },
      ]);
    }
  };

  const handleImportWallet = () => {
    if (!acceptedTerms) {
      Alert.alert(
        t('welcome.termsRequired.title'),
        t('welcome.termsRequired.message'),
        [{ text: t('welcome.termsRequired.ok'), style: 'default' }],
      );
      return;
    }

    Alert.alert(
      t('welcome.importWallet'),
      'Import wallet feature coming soon',
      [{ text: t('common.ok'), style: 'default' }],
    );
  };

  const toggleTermsAcceptance = () => {
    setAcceptedTerms(!acceptedTerms);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <View className="flex-1 items-center justify-center px-5">
        <View className="mb-8">
          <View className="h-[120px] w-[120px] rounded-full bg-background-secondary" />
        </View>

        <View className="items-center gap-4">
          <Text className="w-[335px] text-center text-h4 text-text-primary">
            {t('welcome.title')}
          </Text>
          <Text className="w-[335px] text-center text-button text-text-secondary">
            {t('welcome.subtitle')}
          </Text>
        </View>
      </View>

      <View className="gap-5 px-5 pb-5">
        <View className="items-center">
          <Pressable
            className="flex-row items-center gap-2"
            onPress={toggleTermsAcceptance}
          >
            <View
              className={`h-4 w-4 items-center justify-center rounded border border-text-secondary ${acceptedTerms ? 'border-brand-primary bg-brand-primary' : 'bg-transparent'}`}
            >
              {acceptedTerms && (
                <View className="h-[6px] w-[8px] -rotate-45 border-b-[1.5px] border-l-[1.5px] border-system-white -mt-[2px] ml-[1px]" />
              )}
            </View>
            <Text className="text-label text-text-secondary">
              {t('welcome.termsText')}
            </Text>
          </Pressable>
        </View>

        <View className="gap-2">
          <TouchableOpacity
            className={`w-full min-h-12 items-center justify-center rounded-xl px-6 py-4 ${acceptedTerms ? 'bg-brand-primary' : 'bg-brand-disabled'}`}
            onPress={handleCreateWallet}
            disabled={!acceptedTerms}
            activeOpacity={0.8}
          >
            <Text className="text-button text-button-primary-text">
              {t('welcome.createWallet')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`w-full min-h-12 items-center justify-center rounded-xl px-6 py-4 ${acceptedTerms ? 'bg-button-secondary' : 'bg-background-secondary opacity-60'}`}
            onPress={handleImportWallet}
            disabled={!acceptedTerms}
            activeOpacity={0.8}
          >
            <Text className="text-button text-button-secondary-text">
              {t('welcome.importWallet')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;
