import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { generateMnemonic } from '@/core/keyring';
import { keyringService, walletService } from '@/core/services';
import { web3AuthService } from '@/core/services/Web3AuthService';
import type { NavigationProp } from '@/types/navigation';
import { useTranslation } from '@/utils/i18n';

export interface WelcomeStrings {
  title: string;
  subtitle: string;
  termsText: string;
  createWallet: string;
  importWallet: string;
  googleCta: string;
  termsRequiredTitle: string;
  termsRequiredMessage: string;
  termsRequiredOk: string;
}

export interface UseWelcomeScreenResult {
  strings: WelcomeStrings;
  acceptedTerms: boolean;
  loadingProvider: string | null;
  onToggleTerms: () => void;
  onCreateWallet: () => Promise<void>;
  onImportWallet: () => void;
  onSocialLogin: () => Promise<void>;
}

export const useWelcomeScreen = (): UseWelcomeScreenResult => {
  const navigation = useNavigation<NavigationProp<'Welcome'>>();
  const { t } = useTranslation();

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const strings = useMemo<WelcomeStrings>(
    () => ({
      title: t('welcome.title'),
      subtitle: t('welcome.subtitle'),
      termsText: t('welcome.termsText'),
      createWallet: t('welcome.createWallet'),
      importWallet: t('welcome.importWallet'),
      googleCta: 'Continue with Google',
      termsRequiredTitle: t('welcome.termsRequired.title'),
      termsRequiredMessage: t('welcome.termsRequired.message'),
      termsRequiredOk: t('welcome.termsRequired.ok'),
    }),
    [t],
  );

  const ensureTermsAccepted = useCallback(() => {
    if (!acceptedTerms) {
      Alert.alert(strings.termsRequiredTitle, strings.termsRequiredMessage, [
        { text: strings.termsRequiredOk, style: 'default' },
      ]);
      return false;
    }

    return true;
  }, [
    acceptedTerms,
    strings.termsRequiredMessage,
    strings.termsRequiredOk,
    strings.termsRequiredTitle,
  ]);

  const onToggleTerms = useCallback(() => {
    setAcceptedTerms((prev) => !prev);
  }, []);

  const onCreateWallet = useCallback(async () => {
    if (!ensureTermsAccepted()) {
      return;
    }

    try {
      // Clear all existing wallet data before creating new wallet
      walletService.resetWallet();

      const mnemonic = generateMnemonic();

      if (!mnemonic || typeof mnemonic !== 'string' || mnemonic.trim() === '') {
        Alert.alert(
          t('errors.generic.title'),
          'Failed to generate seed phrase. Please try again.',
          [{ text: t('common.ok'), style: 'default' }],
        );
        return;
      }

      navigation.navigate('SeedPhraseDisplay', { mnemonic });
    } catch (error) {
      console.error('❌ WelcomeScreen: Error creating wallet:', error);
      Alert.alert(t('errors.generic.title'), t('errors.wallet.createFailed'), [
        { text: t('common.ok'), style: 'default' },
      ]);
    }
  }, [ensureTermsAccepted, navigation, t]);

  const onImportWallet = useCallback(() => {
    if (!ensureTermsAccepted()) {
      return;
    }

    navigation.navigate('ImportMethods');
  }, [ensureTermsAccepted, navigation]);

  const onSocialLogin = useCallback(async () => {
    if (!ensureTermsAccepted()) {
      return;
    }

    try {
      setLoadingProvider('google');

      const result = await web3AuthService.loginWithGoogle();

      const privateKey = await result.provider?.request({
        method: 'eth_private_key',
      });

      if (privateKey && privateKey.length > 0) {
        navigation.navigate('CreatePassword', {
          mnemonic: undefined,
          privateKey,
          isWeb3Auth: true,
          userInfo: result.userInfo,
        });
      } else {
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
  }, [ensureTermsAccepted, navigation, t]);

  return {
    strings,
    acceptedTerms,
    loadingProvider,
    onToggleTerms,
    onCreateWallet,
    onImportWallet,
    onSocialLogin,
  };
};
