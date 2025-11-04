import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Alert } from 'react-native';
import { z } from 'zod';
import { apisWallet } from '@/core/apis';
import { useZodForm, ZodFormValues } from '@/core/hooks/form/useZodForm';
import type { NavigationProp } from '@/types/navigation';
import { useTranslation } from '@/utils/i18n';

const unlockSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export type SeedPhraseBackupFormValues = ZodFormValues<typeof unlockSchema>;

export interface SeedPhraseBackupStrings {
  title: string;
  subtitle: string;
  formLabel: string;
  formPlaceholder: string;
  warningTitle: string;
  warningDescription: string;
  buttonLoading: string;
  buttonSubmit: string;
}

export interface UseSeedPhraseBackupScreenResult {
  form: UseFormReturn<SeedPhraseBackupFormValues>;
  strings: SeedPhraseBackupStrings;
  isUnlocking: boolean;
  isSubmitDisabled: boolean;
  onSubmit: () => void;
}

export const useSeedPhraseBackupScreen = (): UseSeedPhraseBackupScreenResult => {
  const navigation = useNavigation<NavigationProp<'SeedPhraseBackup'>>();
  const { t } = useTranslation();
  const [isUnlocking, setIsUnlocking] = useState(false);

  const form = useZodForm(unlockSchema, {
    defaultValues: {
      password: '',
    },
    mode: 'onChange',
  });

  const handleUnlock = useCallback(
    async (values: SeedPhraseBackupFormValues) => {
      if (isUnlocking) return;

      setIsUnlocking(true);
      try {
        await apisWallet.unlockWallet(values.password);
        const mnemonic = await apisWallet.exportMnemonic();

        navigation.navigate('SeedPhraseDisplay', { mnemonic });
      } catch (error) {
        console.error('Error unlocking wallet:', error);
        Alert.alert(
          'Error',
          error instanceof Error ? error.message : 'Failed to unlock wallet. Please try again.',
        );
      } finally {
        setIsUnlocking(false);
      }
    },
    [isUnlocking, navigation, t],
  );

  const onSubmit = useCallback(() => {
    form.handleSubmit(handleUnlock)();
  }, [form, handleUnlock]);

  const strings = useMemo<SeedPhraseBackupStrings>(
    () => ({
      title: t('seedPhrase.backup.title'),
      subtitle: t('seedPhrase.backup.subtitle'),
      formLabel: t('seedPhrase.backup.form.label'),
      formPlaceholder: t('seedPhrase.backup.form.placeholder'),
      warningTitle: t('seedPhrase.backup.warning.title'),
      warningDescription: t('seedPhrase.backup.warning.description'),
      buttonLoading: t('seedPhrase.backup.actions.loading'),
      buttonSubmit: t('seedPhrase.backup.actions.submit'),
    }),
    [t],
  );

  return {
    form,
    strings,
    isUnlocking,
    isSubmitDisabled: !form.formState.isValid || isUnlocking,
    onSubmit,
  };
};
