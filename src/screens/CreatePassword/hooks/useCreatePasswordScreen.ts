import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Alert } from 'react-native';
import { z } from 'zod';
import { walletController } from '@/core/controllers/WalletController';
import { useZodForm, ZodFormValues } from '@/core/hooks/form/useZodForm';
import type { NavigationProp, RootStackParamList } from '@/types/navigation';
import { useTranslation } from '@/utils/i18n';

const createPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type CreatePasswordFormValues = ZodFormValues<typeof createPasswordSchema>;

export interface CreatePasswordStrings {
  headerTitle: string;
  subtitle: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  confirmLabel: string;
  confirmPlaceholder: string;
  buttonLoading: string;
  buttonSubmit: string;
}

export interface UseCreatePasswordScreenResult {
  form: UseFormReturn<CreatePasswordFormValues>;
  strings: CreatePasswordStrings;
  isLoading: boolean;
  isSubmitDisabled: boolean;
  onBackPress: () => void;
  onSubmit: () => void;
}

export const useCreatePasswordScreen = (): UseCreatePasswordScreenResult => {
  const navigation = useNavigation<NavigationProp<'CreatePassword'>>();
  const route = useRoute<RouteProp<RootStackParamList, 'CreatePassword'>>();
  const { mnemonic, privateKey, isImport, isWeb3Auth, userInfo } = route.params || {};
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const form = useZodForm(createPasswordSchema, {
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const handleCreateWallet = useCallback(
    async (values: CreatePasswordFormValues) => {
      if (isLoading) return;

      try {
        setIsLoading(true);

        let addresses: string[] = [];

        if (isWeb3Auth && privateKey) {
          await walletController.bootForNewWallet(values.password);
          addresses = await walletController.importWalletWithPrivateKey(privateKey);
        } else if (isImport && mnemonic) {
          await walletController.bootForNewWallet(values.password);
          addresses = await walletController.importWalletWithMnemonicNew(mnemonic, values.password);
        } else if (isImport && privateKey) {
          await walletController.bootForNewWallet(values.password);
          addresses = await walletController.importWalletWithPrivateKey(privateKey);
        } else {
          const result = await walletController.createWallet(values.password);
          addresses = result.addresses;
        }

        navigation.replace('WalletSuccess', {
          addresses,
          isImport: Boolean(isImport || isWeb3Auth),
          socialInfo: isWeb3Auth ? userInfo : undefined,
        });
      } catch (error) {
        Alert.alert(t('errors.generic.title'), t('errors.wallet.createFailed'));
      } finally {
        setIsLoading(false);
      }
    },
    [isImport, isLoading, isWeb3Auth, mnemonic, navigation, privateKey, t, userInfo],
  );

  const onSubmit = useCallback(() => {
    form.handleSubmit(handleCreateWallet)();
  }, [form, handleCreateWallet]);

  const strings = useMemo<CreatePasswordStrings>(() => {
    const headerTitle = isWeb3Auth
      ? `Welcome ${userInfo?.name || ''}!`
      : isImport
        ? t('welcome.importWallet')
        : t('welcome.createWallet');

    return {
      headerTitle,
      subtitle: t('password.create.subtitle'),
      passwordLabel: t('password.create.passwordLabel'),
      passwordPlaceholder: t('password.create.passwordPlaceholder'),
      confirmLabel: t('password.create.confirmLabel'),
      confirmPlaceholder: t('password.create.confirmPlaceholder'),
      buttonLoading: t('common.loading'),
      buttonSubmit: t('password.create.continue'),
    };
  }, [isImport, isWeb3Auth, t, userInfo?.name]);

  const onBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    form,
    strings,
    isLoading,
    isSubmitDisabled: !form.formState.isValid || isLoading,
    onBackPress,
    onSubmit,
  };
};
