import { useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Alert } from 'react-native';
import { z } from 'zod';
import { apisLock } from '@/core/apis';
import { useZodForm, ZodFormValues } from '@/core/hooks/form/useZodForm';
import { walletService } from '@/core/services';
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
  const route = useRoute();
  const { t } = useTranslation();
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Get the selected keyring index from route params, default to 0 if not provided
  const selectedKeyringIndex = (route.params as any)?.selectedKeyringIndex ?? 0;

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
        // Unlock the wallet first
        await apisLock.unlockWallet(values.password);

        // Export mnemonic for the specific HD keyring index
        const mnemonic = await walletService.exportMnemonicForHDKeyring(selectedKeyringIndex);

        navigation.navigate('SeedPhraseDisplay', { mnemonic });
      } catch (error) {
        Alert.alert(
          'Error',
          error instanceof Error ? error.message : 'Failed to unlock wallet. Please try again.',
        );
      } finally {
        setIsUnlocking(false);
      }
    },
    [isUnlocking, navigation, selectedKeyringIndex, t],
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
