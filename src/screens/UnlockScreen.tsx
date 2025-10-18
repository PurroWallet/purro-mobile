import type { FC } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { FormProvider } from 'react-hook-form';
import { Colors } from '../constants/colors';
import { PasswordInputForm } from '../components';
import KeyboardAvoidingView from '../components/KeyboardAvoidingView';
import { apisKeychain, apisLock } from '../core/apis';
import { useBiometrics } from '../hooks/biometrics';
import { useUnlockForm } from '../hooks/form/useUnlockForm';
import { useTranslation } from '../utils/i18n';
import type { UnlockScreenProps } from '../types/navigation';

const UnlockScreen: FC<UnlockScreenProps> = ({ navigation }) => {
  useTranslation();
  const [biometricAttempted, setBiometricAttempted] = useState(false);
  const { computed, fetchBiometrics } = useBiometrics({ autoFetch: true });
  const { form, handleSubmit, isUnlocking, setIsUnlocking } = useUnlockForm({
    onSuccess: () =>
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      }),
  });

  const { clearErrors, reset, setError, watch } = form;
  const passwordValue = watch('password') ?? '';

  useEffect(() => {
    const attemptBiometricUnlock = async () => {
      try {
        await fetchBiometrics();
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('🔥 Pre-warming vault...');
        console.time('🔥 Vault Pre-warm');
        try {
          await apisLock.unlockWallet('');
        } catch {
          console.log('✅ Vault pre-warmed (expected failure)');
        }
        console.timeEnd('🔥 Vault Pre-warm');

        if (computed.isBiometricsEnabled && !isUnlocking && !biometricAttempted) {
          console.log('🔐 Attempting biometric unlock...');
          setIsUnlocking(true);
          clearErrors('password');

          try {
            const passwordFromKeychain = await apisKeychain.requestGenericPassword();
            console.log('🔐 Got password from keychain:', !!passwordFromKeychain);

            if (passwordFromKeychain) {
              apisLock.markAsUnlocked();
              reset({ password: '' });
              navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
              return;
            }

            setError('password', {
              message: 'Biometric authentication cancelled. Please enter your password.',
            });
          } catch (error) {
            console.error('❌ Biometric unlock error:', error);
            setError('password', {
              message: 'Biometric authentication failed. Please enter your password.',
            });
          } finally {
            setIsUnlocking(false);
            setBiometricAttempted(true);
          }
        }
      } catch (error) {
        console.error('❌ Fetch biometrics error:', error);
      }
    };

    attemptBiometricUnlock();
  }, [
    biometricAttempted,
    computed.isBiometricsEnabled,
    fetchBiometrics,
    isUnlocking,
    navigation,
    clearErrors,
    reset,
    setError,
    setIsUnlocking,
  ]);

  const onSubmit = useCallback(() => {
     handleSubmit();
  }, [handleSubmit]);

  const isDisabled = !passwordValue.trim() || isUnlocking;

  return (
    <KeyboardAvoidingView>
      <StatusBar barStyle="light-content" backgroundColor="#161616" />

      <View className="flex-1 items-center justify-center px-5">
        <View className="mb-8 h-[120px] w-[120px] rounded-[60px] bg-background-secondary" />
        <Text className="text-center text-h4 text-text-primary">
          Unlock Purro Wallet
        </Text>
      </View>

      <View className="px-5 pb-10">
        <FormProvider {...form}>
          <View className="gap-4">
            <PasswordInputForm
              name="password"
              label="Password"
              placeholder="Enter your password"
              autoCapitalize="none"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={onSubmit}
            />

            <TouchableOpacity
              className={`min-h-14 items-center justify-center rounded-xl px-6 py-4 ${
                isDisabled ? 'bg-button-primary-disabled' : 'bg-brand-primary'
              }`}
              onPress={onSubmit}
              disabled={isDisabled}
            >
              {isUnlocking ? (
                <ActivityIndicator size="small" color={Colors.text.primary} />
              ) : (
                <Text className="text-button text-button-primary-text">Unlock</Text>
              )}
            </TouchableOpacity>
          </View>
        </FormProvider>
      </View>
    </KeyboardAvoidingView>
  );
};

export default UnlockScreen;
