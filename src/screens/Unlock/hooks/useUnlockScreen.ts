import { useCallback, useEffect, useMemo, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { apisKeychain, apisLock } from '@/core/apis';
import { useBiometrics } from '@/core/hooks/biometrics';
import { useUnlockForm } from '@/core/hooks/form/useUnlockForm';
import type { UnlockScreenProps } from '@/types/navigation';
import { useTranslation } from '@/utils/i18n';

export interface UnlockStrings {
  title: string;
  formLabel: string;
  formPlaceholder: string;
  submit: string;
}

export interface UseUnlockScreenResult {
  form: UseFormReturn<{ password: string }>;
  strings: UnlockStrings;
  isUnlocking: boolean;
  isDisabled: boolean;
  onSubmit: () => void;
}

export const useUnlockScreen = (
  navigation: UnlockScreenProps['navigation'],
): UseUnlockScreenResult => {
  const { t } = useTranslation();
  const [biometricAttempted, setBiometricAttempted] = useState(false);
  const { computed, fetchBiometrics } = useBiometrics({ autoFetch: true });
  const { form, handleSubmit, isUnlocking, setIsUnlocking } = useUnlockForm({
    onSuccess: async () => {
      console.log('🔓 UnlockScreen: Unlock successful - keyrings will load on-demand when needed');

      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    },
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

              // Biometric unlock successful - keyrings will load on-demand when needed
              console.log(
                '🔓 UnlockScreen: Biometric unlock successful - keyrings will load on-demand',
              );

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
        // Silent failure
      }
    };

    attemptBiometricUnlock();
  }, [
    biometricAttempted,
    clearErrors,
    computed.isBiometricsEnabled,
    fetchBiometrics,
    isUnlocking,
    navigation,
    reset,
    setError,
    setIsUnlocking,
    t,
  ]);

  const onSubmit = useCallback(() => {
    handleSubmit();
  }, [handleSubmit]);

  const isDisabled = useMemo(
    () => !passwordValue.trim() || isUnlocking,
    [isUnlocking, passwordValue],
  );

  const strings = useMemo<UnlockStrings>(
    () => ({
      title: t('unlock.title'),
      formLabel: t('unlock.form.label'),
      formPlaceholder: t('unlock.form.placeholder'),
      submit: t('unlock.actions.submit'),
    }),
    [t],
  );

  return {
    form,
    strings,
    isUnlocking,
    isDisabled,
    onSubmit,
  };
};
