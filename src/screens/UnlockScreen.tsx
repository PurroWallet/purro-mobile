import type { FC } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { ActivityIndicator, StatusBar, Text, View } from 'react-native';
import { Button, PasswordInputForm } from '../components';
import KeyboardAvoidingView from '../components/KeyboardAvoidingView';
import { Colors } from '../constants/colors';
import { apisKeychain, apisLock } from '../core/apis';
import { useBiometrics } from '../core/hooks/biometrics';
import { useUnlockForm } from '../core/hooks/form/useUnlockForm';
import type { UnlockScreenProps } from '../types/navigation';
import { useTranslation } from '../utils/i18n';

const UnlockScreen: FC<UnlockScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
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
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (computed.isBiometricsEnabled && !isUnlocking && !biometricAttempted) {
          setIsUnlocking(true);
          clearErrors('password');

          try {
            const passwordFromKeychain = await apisKeychain.requestGenericPassword();

            if (passwordFromKeychain) {
              apisLock.markAsUnlocked();
              reset({ password: '' });
              navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
              return;
            }

            setError('password', {
              message: t('unlock.biometrics.cancelled'),
            });
          } catch (error) {
            setError('password', {
              message: t('unlock.biometrics.failed'),
            });
          } finally {
            setIsUnlocking(false);
            setBiometricAttempted(true);
          }
        }
      } catch (error) {
        // Handle fetch biometrics error silently
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
        <Text className="text-center text-h4 text-text-primary">{t('unlock.title')}</Text>
      </View>

      <View className="px-5 pb-10">
        <FormProvider {...form}>
          <View className="gap-4">
            <PasswordInputForm
              name="password"
              label={t('unlock.form.label')}
              placeholder={t('unlock.form.placeholder')}
              autoCapitalize="none"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={onSubmit}
            />

            <Button
              type="primary"
              title={t('unlock.actions.submit')}
              onPress={onSubmit}
              disabled={isDisabled}
            />
          </View>
        </FormProvider>
      </View>
    </KeyboardAvoidingView>
  );
};

export default UnlockScreen;
