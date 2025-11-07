import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components';
import { Icon } from '@/components/Icon';
import { useThemeMode } from '@/core/hooks/useTheme';
import { generateMnemonic } from '@/core/keyring';
import { walletService } from '@/core/services';
import { SocialLoginResult, web3AuthService } from '@/core/services/Web3AuthService';
import type { WelcomeScreenProps } from '@/types/navigation';
import { useTranslation } from '@/utils/i18n';

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const { themeMode } = useThemeMode();

  const ensureTermsAccepted = useCallback(() => {
    if (!acceptedTerms) {
      Alert.alert(t('welcome.termsRequired.title'), t('welcome.termsRequired.message'), [
        { text: t('welcome.termsRequired.ok'), style: 'default' },
      ]);
      return false;
    }

    return true;
  }, [acceptedTerms, t]);

  const handleCreateWallet = async () => {
    if (!ensureTermsAccepted()) {
      return;
    }

    try {
      console.log('🚀 handleCreateWallet: Starting wallet creation...');

      // Generate mnemonic directly - no store needed
      const mnemonic = generateMnemonic();
      console.log('📝 Generated mnemonic:', mnemonic?.substring(0, 20) + '...');

      // Validate mnemonic before navigation
      if (!mnemonic || typeof mnemonic !== 'string' || mnemonic.trim() === '') {
        console.error('❌ Invalid mnemonic generated:', mnemonic);
        Alert.alert(
          t('errors.generic.title'),
          'Failed to generate seed phrase. Please try again.',
          [{ text: t('common.ok'), style: 'default' }],
        );
        return;
      }

      console.log('✅ Mnemonic valid, navigating to SeedPhraseDisplay...');
      // Navigate immediately to seed phrase screen
      navigation.navigate('SeedPhraseDisplay', { mnemonic });
    } catch (error) {
      console.error('❌ handleCreateWallet error:', error);
      Alert.alert(t('errors.generic.title'), t('errors.wallet.createFailed'), [
        { text: t('common.ok'), style: 'default' },
      ]);
    }
  };

  const handleImportWallet = () => {
    if (!ensureTermsAccepted()) {
      return;
    }

    navigation.navigate('ImportMethods');
  };

  const handleSocialLogin = async () => {
    if (!ensureTermsAccepted()) {
      return;
    }

    try {
      console.log('🚀 handleSocialLogin: Starting Google login...');
      setLoadingProvider('google');

      const result = await web3AuthService.loginWithGoogle();
      console.log('✅ Web3Auth login successful:', result.userInfo?.email);

      // SUCCESS: Navigate to wallet creation flow

      // Get the private key from Web3Auth provider
      console.log('🔑 Getting private key from Web3Auth provider...');
      const privateKey = await result.provider?.request({
        method: 'eth_private_key',
      });
      console.log('🔐 Private key retrieved:', privateKey ? 'SUCCESS' : 'FAILED');

      if (privateKey && privateKey.length > 0) {
        console.log('🎯 Navigating to CreatePassword with Web3Auth data...');
        // For Web3Auth users, skip seed phrase display and go directly to password creation
        // Web3Auth users don't have a traditional seed phrase
        navigation.navigate('CreatePassword', {
          mnemonic: undefined, // No mnemonic for Web3Auth users
          privateKey: privateKey,
          isWeb3Auth: true,
          userInfo: result.userInfo,
        });
      } else {
        console.error('❌ No private key retrieved from Web3Auth');
        // Fallback: Show success message if we can't get the private key
        Alert.alert(
          'Login Successful!',
          `Welcome ${result.userInfo.name}! Your Web3 wallet is ready.`,
          [{ text: 'Continue', style: 'default' }],
        );
      }
    } catch (error) {
      console.error('❌ Google login failed:', error);

      let errorMessage = t('errors.wallet.createFailed');
      if (error instanceof Error) {
        if (error.message.includes('popup')) {
          errorMessage = 'Login popup was closed. Please try again.';
        } else if (error.message.includes('cancelled')) {
          errorMessage = 'Login was cancelled. Please try again.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        }
      }

      Alert.alert(t('errors.generic.title'), errorMessage, [
        { text: t('common.ok'), style: 'default' },
      ]);
    } finally {
      setLoadingProvider(null);
    }
  };

  const toggleTermsAcceptance = () => {
    setAcceptedTerms(!acceptedTerms);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <View className="flex-1 items-center justify-center px-5">
        <View className="mb-8">
          <View className="h-[120px] w-[120px] items-center justify-center rounded-full bg-background-secondary">
            <Icon
              name="RabbyLogo"
              size={60}
              color={
                themeMode === 'light'
                  ? 'rgb(var(--color-brand-primary))'
                  : 'rgb(var(--color-text-primary))'
              }
            />
          </View>
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
          <Pressable className="flex-row items-center gap-2" onPress={toggleTermsAcceptance}>
            <View
              className={`h-4 w-4 items-center justify-center rounded border border-text-secondary ${acceptedTerms ? 'border-brand-primary bg-brand-primary' : 'bg-transparent'}`}
            >
              {acceptedTerms && (
                <View className="h-[6px] w-[8px] -rotate-45 border-b-[1.5px] border-l-[1.5px] border-system-white -mt-[2px] ml-[1px]" />
              )}
            </View>
            <Text className="text-label text-text-secondary">{t('welcome.termsText')}</Text>
          </Pressable>
        </View>

        {/* Social Login Section */}
        <View className="mt-4">
          {/* Loading indicator */}
          {loadingProvider && (
            <View className="mb-3 items-center">
              <View className="flex-row items-center gap-2">
                <ActivityIndicator size="small" className="text-brand-primary" />
                <Text className="text-sm text-text-secondary">
                  Connecting to {loadingProvider}...
                </Text>
              </View>
            </View>
          )}

          {/* Single Google login button */}
          <View className="w-full">
            <Button
              type="secondary"
              title="Continue with Google"
              onPress={handleSocialLogin}
              disabled={!acceptedTerms || loadingProvider !== null}
              className="w-full"
            />
          </View>
        </View>

        <View className="flex-row items-center w-full gap-x-2">
          <View className="flex-1 h-[1px] bg-gray-500" />
          <Text className="mx-2 text-base text-gray-500 uppercase">or</Text>
          <View className="flex-1 h-[1px] bg-gray-500" />
        </View>

        <Button
          type="primary"
          title={t('welcome.createWallet')}
          onPress={handleCreateWallet}
          disabled={!acceptedTerms}
        />

        <Button
          type="secondary"
          title={t('welcome.importWallet')}
          onPress={handleImportWallet}
          disabled={!acceptedTerms}
        />
      </View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;
