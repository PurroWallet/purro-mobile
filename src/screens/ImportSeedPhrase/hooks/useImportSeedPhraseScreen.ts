import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Alert } from 'react-native';
import { z } from 'zod';
import { useZodForm, ZodFormValues } from '@/core/hooks/form/useZodForm';
import type { NavigationProp } from '@/types/navigation';
import { useTranslation } from '@/utils/i18n';

const importSeedPhraseSchema = z
  .object({
    mnemonic: z.string().min(1, 'Seed phrase is required'),
  })
  .refine(
    (data) => {
      const words = data.mnemonic.trim().split(/\s+/);
      if (words.length !== 12) {
        return false;
      }

      return words.every((word) => /^[a-zA-Z]+$/.test(word));
    },
    {
      message: 'Invalid seed phrase. Must be exactly 12 words.',
    },
  );

export type ImportSeedPhraseFormValues = ZodFormValues<typeof importSeedPhraseSchema>;

export interface ImportSeedPhraseStrings {
  title: string;
  subtitle: string;
  formLabel: string;
  formPlaceholder: string;
  warningTitle: string;
  warningDescription: string;
  buttonLoading: string;
  buttonSubmit: string;
}

export interface UseImportSeedPhraseScreenResult {
  form: UseFormReturn<ImportSeedPhraseFormValues>;
  strings: ImportSeedPhraseStrings;
  isImporting: boolean;
  isSubmitDisabled: boolean;
  onSubmit: () => void;
}

export const useImportSeedPhraseScreen = (): UseImportSeedPhraseScreenResult => {
  const navigation = useNavigation<NavigationProp<'ImportSeedPhrase'>>();
  const { t } = useTranslation();
  const [isImporting, setIsImporting] = useState(false);

  const form = useZodForm(importSeedPhraseSchema, {
    defaultValues: {
      mnemonic: '',
    },
    mode: 'onChange',
  });

  const handleImport = useCallback(
    async (values: ImportSeedPhraseFormValues) => {
      if (isImporting) return;

      setIsImporting(true);
      try {
        const mnemonicWords = values.mnemonic.trim().split(/\s+/);
        if (mnemonicWords.length !== 12) {
          throw new Error(t('importSeedPhrase.errors.invalidWords'));
        }

        navigation.navigate('CreatePassword', {
          mnemonic: values.mnemonic.trim(),
          isImport: true,
        });
      } catch (error) {
        console.error('Error validating seed phrase:', error);
        Alert.alert(
          t('importSeedPhrase.alert.title'),
          error instanceof Error ? error.message : t('importSeedPhrase.alert.generic'),
        );
      } finally {
        setIsImporting(false);
      }
    },
    [isImporting, navigation, t],
  );

  const onSubmit = useCallback(() => {
    form.handleSubmit(handleImport)();
  }, [form, handleImport]);

  const strings = useMemo<ImportSeedPhraseStrings>(
    () => ({
      title: t('importSeedPhrase.title'),
      subtitle: t('importSeedPhrase.subtitle'),
      formLabel: t('importSeedPhrase.form.label'),
      formPlaceholder: t('importSeedPhrase.form.placeholder'),
      warningTitle: t('importSeedPhrase.guidelines.title'),
      warningDescription: t('importSeedPhrase.guidelines.description'),
      buttonLoading: t('importSeedPhrase.actions.loading'),
      buttonSubmit: t('importSeedPhrase.actions.submit'),
    }),
    [t],
  );

  return {
    form,
    strings,
    isImporting,
    isSubmitDisabled: !form.formState.isValid || isImporting,
    onSubmit,
  };
};
