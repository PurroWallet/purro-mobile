import React, { useCallback, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { useSocialLogin } from '@/hooks/auth/useSocialLogin';
import { Button } from '@/components';
import { Icon } from '@/components/Icon';
import { useThemeMode } from '@/core/hooks/useTheme';
import { useCreateWallet } from '@/core/hooks/wallet/useCreateWallet';
import type { WelcomeScreenProps } from '@/types/navigation';
import { useTranslation } from '@/utils/i18n';

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { themeMode } = useThemeMode();

  const { getSeedPhrase } = useCreateWallet();
  // const { loginWithGoogle, loginWithFacebook, isLoading, loadingProvider } =
  //   useSocialLogin();

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
    if (!ensureTermsAccepted()) {
      return;
    }

    navigation.navigate('ImportMethods');
  };

  // const handleSocialLogin = useCallback(
  //   async (provider: any) => {
  //     if (!ensureTermsAccepted()) {
  //       return;
  //     }

  //     try {
  //       const result =
  //         provider === LOGIN_PROVIDER.GOOGLE
  //           ? await loginWithGoogle()
  //           : await loginWithFacebook();

  //       const displayName = result.userInfo.name || result.userInfo.email;
  //       Alert.alert(
  //         'Login successful',
  //         displayName
  //           ? `Welcome back, ${displayName}!`
  //           : 'You have successfully signed in.',
  //       );
  //     } catch (error) {
  //       console.error('Social login failed:', error);
  //       Alert.alert('Login failed', 'Unable to continue with social login.');
  //     }
  //   },
  //   [ensureTermsAccepted, loginWithFacebook, loginWithGoogle],
  // );

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

        <View className="gap-2">
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

        {/* <View className="gap-2">
          <TouchableOpacity
            className={`w-full min-h-12 items-center justify-center rounded-xl border border-background-tertiary px-6 py-4 ${acceptedTerms ? 'bg-background-secondary' : 'bg-background-secondary opacity-60'}`}
            onPress={() => handleSocialLogin(LOGIN_PROVIDER.GOOGLE)}
            disabled={!acceptedTerms || isLoading}
            activeOpacity={0.8}
          >
            <Text className="text-button text-text-primary">
              {loadingProvider === LOGIN_PROVIDER.GOOGLE
                ? 'Signing in with Google…'
                : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`w-full min-h-12 items-center justify-center rounded-xl border border-background-tertiary px-6 py-4 ${acceptedTerms ? 'bg-background-secondary' : 'bg-background-secondary opacity-60'}`}
            onPress={() => handleSocialLogin(LOGIN_PROVIDER.FACEBOOK)}
            disabled={!acceptedTerms || isLoading}
            activeOpacity={0.8}
          >
            <Text className="text-button text-text-primary">
              {loadingProvider === LOGIN_PROVIDER.FACEBOOK
                ? 'Signing in with Facebook…'
                : 'Continue with Facebook'}
            </Text>
          </TouchableOpacity>
        </View> */}
      </View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;
