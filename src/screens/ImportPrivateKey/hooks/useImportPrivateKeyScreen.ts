import { useNavigation } from '@react-navigation/native';
import { Wallet } from 'ethers';
import { useCallback, useMemo, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Alert } from 'react-native';
import { z } from 'zod';
import { useZodForm, ZodFormValues } from '@/core/hooks/form/useZodForm';
import type { NavigationProp } from '@/types/navigation';
import { useTranslation } from '@/utils/i18n';

const importPrivateKeySchema = z.object({
  privateKey: z.string().min(1, 'Private key is required'),
});

export type ImportPrivateKeyFormValues = ZodFormValues<typeof importPrivateKeySchema>;

export interface ImportPrivateKeyStrings {
  title: string;
  subtitle: string;
  formLabel: string;
  formPlaceholder: string;
  warningTitle: string;
  warningDescription: string;
  buttonLoading: string;
  buttonSubmit: string;
}

export interface UseImportPrivateKeyScreenResult {
  form: UseFormReturn<ImportPrivateKeyFormValues>;
  strings: ImportPrivateKeyStrings;
  isImporting: boolean;
  isSubmitDisabled: boolean;
  onSubmit: () => void;
}

export const useImportPrivateKeyScreen = (): UseImportPrivateKeyScreenResult => {
  const navigation = useNavigation<NavigationProp<'ImportPrivateKey'>>();
  const { t } = useTranslation();
  const [isImporting, setIsImporting] = useState(false);

  const form = useZodForm(importPrivateKeySchema, {
    defaultValues: {
      privateKey: '',
    },
    mode: 'onChange',
  });

  const handleImport = useCallback(
    async (values: ImportPrivateKeyFormValues) => {
      if (isImporting) return;

      setIsImporting(true);
      try {
        let privateKey = values.privateKey.trim();

        if (privateKey.startsWith('0x')) {
          privateKey = privateKey.slice(2);
        }

        if (!/^[a-fA-F0-9]{64}$/.test(privateKey)) {
          throw new Error(t('importPrivateKey.errors.invalidFormat'));
        }

        try {
          const wallet = new Wallet(`0x${privateKey}`);

          if (!wallet.address) {
            throw new Error(t('importPrivateKey.errors.invalidKey'));
          }

          const syntheticMnemonic = `PRIVATE_KEY:${privateKey}:${wallet.address}`;

          navigation.navigate('CreatePassword', {
            mnemonic: syntheticMnemonic,
            isPrivateKeyImport: true,
          });
        } catch {
          throw new Error(t('importPrivateKey.errors.invalidKey'));
        }
      } catch (error) {
        console.error('Error importing private key:', error);
        Alert.alert(
          t('importPrivateKey.alert.title'),
          error instanceof Error ? error.message : t('importPrivateKey.alert.generic'),
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

  const strings = useMemo<ImportPrivateKeyStrings>(
    () => ({
      title: t('importPrivateKey.title'),
      subtitle: t('importPrivateKey.subtitle'),
      formLabel: t('importPrivateKey.form.label'),
      formPlaceholder: t('importPrivateKey.form.placeholder'),
      warningTitle: t('importPrivateKey.warning.title'),
      warningDescription: t('importPrivateKey.warning.description'),
      buttonLoading: t('importPrivateKey.actions.loading'),
      buttonSubmit: t('importPrivateKey.actions.submit'),
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
