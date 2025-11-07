import { BottomSheetView } from '@gorhom/bottom-sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import z from 'zod';
import { Button, PasswordInputForm } from '@/components';
import { walletController } from '@/core/controllers/WalletController';
import { useTranslation } from '@/utils/i18n';
import type { AccountStackParamList } from '../AccountStackNavigator';
import BaseScreen from '../components/BaseScreen';

type Props = NativeStackScreenProps<AccountStackParamList, 'CreatePassword'> & {
  onClose: () => void;
  parentNavigation: any;
  onAccountCreated?: (account: { address: string }) => void;
};

interface RouteParams {
  mnemonic: string;
  isPrivateKeyImport?: boolean;
  isNewAccount?: boolean;
}

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'password.create.validation.tooShort')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'password.create.validation.requirement'),
    confirmPassword: z.string().min(1, 'password.create.validation.confirmRequired'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'password.create.validation.mismatch',
    path: ['confirmPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

const CreatePasswordScreen: React.FC<Props> = ({
  navigation,
  onClose,
  parentNavigation,
  onAccountCreated,
  route,
}) => {
  const { mnemonic, isPrivateKeyImport, isNewAccount } = (route.params || {}) as RouteParams;
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    mode: 'onChange',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = form;

  const onSubmit = async (data: PasswordFormData) => {
    try {
      setIsLoading(true);

      let addresses: string[] = [];

      if (isNewAccount) {
        // Create new account
        const result = await walletController.createWallet(data.password);
        addresses = result.addresses;
      } else if (mnemonic) {
        // Import existing wallet
        if (isPrivateKeyImport) {
          // Handle private key import
          addresses = await walletController.importWalletWithPrivateKey(mnemonic);
        } else {
          // Handle mnemonic import
          addresses = await walletController.importWalletWithMnemonic(mnemonic, data.password);
        }
      }

      // Navigate to success screen
      navigation.navigate('Success', {
        title: isNewAccount
          ? t('accountBottomSheet.success.accountCreated.title')
          : t('accountBottomSheet.success.walletImported.title'),
        message: isNewAccount
          ? t('accountBottomSheet.success.accountCreated.message')
          : t('accountBottomSheet.success.walletImported.message'),
        newAccountAddress: addresses && addresses.length > 0 ? addresses[0] : undefined,
        shouldSetAsCurrent: isNewAccount,
        onAccountCreated: (newAccount) => {
          console.log('📝 CreatePasswordScreen: New account created callback');
          console.log('📍 New account:', newAccount.address.substring(0, 10) + '...');

          // Update current account if needed
          if (onAccountCreated) {
            onAccountCreated(newAccount);
          }
        },
      });
    } catch (error) {
      console.error('Failed to create wallet:', error);
      Alert.alert(t('errors.generic.title'), t('accountBottomSheet.errors.importWalletFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const renderFooter = () => (
    <View className="absolute bottom-10 w-full px-6">
      <Button
        type="primary"
        title={
          isLoading
            ? t('accountBottomSheet.createPassword.actions.loading')
            : t('accountBottomSheet.createPassword.actions.submit')
        }
        onPress={handleSubmit(onSubmit)}
        disabled={!isValid || isLoading}
        className="w-full"
      />
    </View>
  );

  return (
    <BaseScreen
      title={t('accountBottomSheet.createPassword.title')}
      showBackButton={true}
      onBack={() => navigation.goBack()}
      footer={renderFooter()}
      isScrollable={true}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-1 px-5 justify-between">
          <View className="flex-1">
            <Text className="mb-2 text-lg text-text-primary">
              {t('accountBottomSheet.createPassword.title')}
            </Text>
            <Text className="mb-6 text-sm text-text-secondary">
              {t('accountBottomSheet.createPassword.subtitle')}
            </Text>

            <FormProvider {...form}>
              <PasswordInputForm
                name="password"
                label={t('accountBottomSheet.createPassword.passwordLabel')}
                placeholder={t('accountBottomSheet.createPassword.passwordPlaceholder')}
              />

              <PasswordInputForm
                name="confirmPassword"
                label={t('accountBottomSheet.createPassword.confirmLabel')}
                placeholder={t('accountBottomSheet.createPassword.confirmPlaceholder')}
              />
            </FormProvider>

            <Text className="mt-2 text-sm leading-5 text-text-secondary">
              {t('accountBottomSheet.createPassword.requirement')}
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </BaseScreen>
  );
};

export default CreatePasswordScreen;
