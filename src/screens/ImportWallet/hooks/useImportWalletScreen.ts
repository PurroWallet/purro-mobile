import { useCallback, useMemo, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Alert } from 'react-native';
import { z } from 'zod';
import { apisWallet } from '@/core/apis';
import { useZodForm, ZodFormValues } from '@/core/hooks/form/useZodForm';
import type { ImportWalletScreenProps } from '@/types/navigation';
import { useTranslation } from '@/utils/i18n';

const importWalletSchema = z
  .object({
    mnemonic: z.string().min(1, 'Seed phrase is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Passwords do not match',
      });
    }
  });

export type ImportWalletFormValues = ZodFormValues<typeof importWalletSchema>;

export interface ImportWalletStrings {
  title: string;
  subtitle: string;
  mnemonicLabel: string;
  mnemonicPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  confirmPasswordLabel: string;
  confirmPasswordPlaceholder: string;
  buttonLoading: string;
  buttonSubmit: string;
}

export interface UseImportWalletScreenResult {
  form: UseFormReturn<ImportWalletFormValues>;
  strings: ImportWalletStrings;
  isImporting: boolean;
  isSubmitDisabled: boolean;
  onSubmit: () => void;
}

export const useImportWalletScreen = (
  navigation: ImportWalletScreenProps['navigation'],
): UseImportWalletScreenResult => {
  const { t } = useTranslation();
  const [isImporting, setIsImporting] = useState(false);

  const form = useZodForm(importWalletSchema, {
    defaultValues: {
      mnemonic: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const handleImport = useCallback(
    async (values: ImportWalletFormValues) => {
      if (isImporting) return;

      setIsImporting(true);
      try {
        const words = values.mnemonic.trim().split(/\s+/);
        if (words.length !== 12 && words.length !== 24) {
          throw new Error(t('importWallet.errors.invalidWords'));
        }

        await apisWallet.importWallet(values.mnemonic.trim(), values.password);

        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } catch (error) {
        console.error('Error importing wallet:', error);
        Alert.alert(
          t('importWallet.alert.title'),
          error instanceof Error ? error.message : t('importWallet.alert.generic'),
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

  const strings = useMemo<ImportWalletStrings>(
    () => ({
      title: t('importWallet.title'),
      subtitle: t('importWallet.subtitle'),
      mnemonicLabel: t('importWallet.form.mnemonic.label'),
      mnemonicPlaceholder: t('importWallet.form.mnemonic.placeholder'),
      passwordLabel: t('importWallet.form.password.label'),
      passwordPlaceholder: t('importWallet.form.password.placeholder'),
      confirmPasswordLabel: t('importWallet.form.confirmPassword.label'),
      confirmPasswordPlaceholder: t('importWallet.form.confirmPassword.placeholder'),
      buttonLoading: t('importWallet.actions.loading'),
      buttonSubmit: t('importWallet.actions.submit'),
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
