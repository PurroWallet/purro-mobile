import { BottomSheetView } from '@gorhom/bottom-sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from 'react-native';
import z from 'zod';
import { PasswordInputForm } from '@/components';
import { walletController } from '@/core/controllers/WalletController';
import { useTranslation } from '@/utils/i18n';
import type { AccountStackParamList } from '../AccountStackNavigator';
import SheetHeader from '../components/SheetHeader';

type Props = NativeStackScreenProps<AccountStackParamList, 'CreatePassword'> & {
  onClose: () => void;
  parentNavigation: any;
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
  route,
}) => {
  const { mnemonic, isPrivateKeyImport, isNewAccount } = (route.params || {}) as RouteParams;
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    mode: 'onChange',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

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
      });
    } catch (error) {
      console.error('Failed to create wallet:', error);
      Alert.alert(t('errors.generic.title'), t('accountBottomSheet.errors.importWalletFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BottomSheetView className="flex-1">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <SheetHeader
          title={t('accountBottomSheet.createPassword.title')}
          onBack={() => navigation.goBack()}
        />
        <View className="mb-4" />

        <View className="flex-1 px-5 justify-between">
          <View className="flex-1">
            <Text className="mb-2 text-lg text-text-primary">
              {t('accountBottomSheet.createPassword.title')}
            </Text>
            <Text className="mb-6 text-sm text-text-secondary">
              {t('accountBottomSheet.createPassword.subtitle')}
            </Text>

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

            <Text className="mt-2 text-sm leading-5 text-text-secondary">
              {t('accountBottomSheet.createPassword.requirement')}
            </Text>
          </View>

          <View className="px-5 pb-6">
            <TouchableOpacity
              className={`w-full min-h-12 items-center justify-center rounded-xl px-6 py-4 ${
                !isValid || isLoading ? 'bg-background-secondary' : 'bg-brand-primary'
              }`}
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || isLoading}
            >
              <Text
                className={`text-base font-medium ${
                  !isValid || isLoading ? 'text-text-secondary' : 'text-button-primary-text'
                }`}
              >
                {isLoading
                  ? t('accountBottomSheet.createPassword.actions.loading')
                  : t('accountBottomSheet.createPassword.actions.submit')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </BottomSheetView>
  );
};

export default CreatePasswordScreen;
