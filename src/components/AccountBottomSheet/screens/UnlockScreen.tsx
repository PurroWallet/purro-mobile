import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { FormProvider } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react-native';
import { apisLock } from '@/core/apis';
import { useZodForm, ZodFormValues } from '@/core/hooks/form/useZodForm';
import { z } from 'zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AccountStackParamList } from '../AccountStackNavigator';
import SheetHeader from '../components/SheetHeader';
import { walletController } from '@/core/controllers/WalletController';
import { useTranslation } from '@/utils/i18n';

const unlockSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

type UnlockFormValues = ZodFormValues<typeof unlockSchema>;

type Props = NativeStackScreenProps<AccountStackParamList, 'Unlock'> & {
  onClose: () => void;
  parentNavigation: any;
};

interface RouteParams {
  mnemonic?: string;
  isImport?: boolean;
  isPrivateKeyImport?: boolean;
  isNewAccount?: boolean;
}

const UnlockScreen: React.FC<Props> = ({
  navigation,
  onClose: _onClose,
  parentNavigation: _parentNavigation,
  route,
}) => {
  const { mnemonic, isImport, isPrivateKeyImport, isNewAccount } =
    (route.params || {}) as RouteParams;

  const [showPassword, setShowPassword] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const { t } = useTranslation();

  const form = useZodForm(unlockSchema, {
    defaultValues: {
      password: '',
    },
    mode: 'onChange',
  });

  const passwordValue = form.watch('password') ?? '';
  const isValid = form.formState.isValid;

  const handleUnlock = useCallback(
    async (values: UnlockFormValues) => {
      if (isUnlocking) return;

      setIsUnlocking(true);
      try {
        // Unlock wallet with password
        await apisLock.unlockWallet(values.password);

        if (isNewAccount) {
          // Create new account
          await walletController.addNewAccount();
        } else if (isImport && mnemonic) {
          // Import wallet
            if (isPrivateKeyImport) {
              // Handle private key import
              await walletController.importWalletWithPrivateKey(mnemonic);
            } else {
              // Handle mnemonic import
              await walletController.importWalletWithMnemonic(mnemonic, values.password);
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
        console.error('Error unlocking wallet:', error);
        form.setError('password', {
            message: t('accountBottomSheet.errors.incorrectPassword'),
        });
      } finally {
        setIsUnlocking(false);
      }
    },
    [
      isUnlocking,
      isNewAccount,
      isImport,
      isPrivateKeyImport,
      mnemonic,
      form,
      navigation,
    ],
  );

  const handleSubmit = () => {
    form.handleSubmit(handleUnlock)();
  };

  const isDisabled = !passwordValue.trim() || !isValid || isUnlocking;

  return (
    <BottomSheetView className="flex-1">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <SheetHeader
          title={t('accountBottomSheet.unlockTitle')}
          onBack={() => navigation.goBack()}
        />
        <View className="mb-4" />

        <View className="flex-1 px-5 justify-between">
          <View className="flex-1">
            <Text className="mb-2 text-lg text-text-primary">
              {t('accountBottomSheet.passwordPromptTitle')}
            </Text>
            <Text className="mb-6 text-sm text-text-secondary">
              {isNewAccount
                ? t('accountBottomSheet.passwordPromptCreate')
                : isImport
                ? t(
                    isPrivateKeyImport
                      ? 'accountBottomSheet.passwordPromptImportPrivateKey'
                      : 'accountBottomSheet.passwordPromptImportMnemonic',
                  )
                : t('accountBottomSheet.passwordPromptUnlock')}
            </Text>

            <FormProvider {...form}>
              <View className="mb-5">
                <Text className="mb-2 text-sm text-text-primary">
                  {t('accountBottomSheet.passwordLabel')}
                </Text>
                <View className="flex-row items-center rounded-xl border border-border-primary px-4 py-4">
                  <TextInput
                    className="flex-1 text-lg text-text-primary"
                    value={passwordValue}
                    onChangeText={text => form.setValue('password', text)}
                    placeholder={t('accountBottomSheet.passwordPlaceholder')}
                    placeholderTextColor="rgb(var(--color-text-secondary))"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password"
                    textContentType="password"
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                  />
                  <TouchableOpacity
                    className="ml-2"
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="rgb(var(--color-text-secondary))" />
                    ) : (
                      <Eye size={20} color="rgb(var(--color-text-secondary))" />
                    )}
                  </TouchableOpacity>
                </View>
                {form.formState.errors.password && (
                  <Text className="mt-2 text-sm text-system-error">
                    {form.formState.errors.password.message}
                  </Text>
                )}
              </View>
            </FormProvider>
          </View>
        </View>
        <View className="absolute bottom-10 w-full px-6">
          <TouchableOpacity
            className={`w-full min-h-12 items-center justify-center rounded-xl px-6 py-4 ${
              !passwordValue.trim() || isUnlocking
                ? 'bg-background-secondary'
                : 'bg-brand-primary'
            }`}
            onPress={handleSubmit}
            disabled={!passwordValue.trim() || isUnlocking}
          >
            {isUnlocking ? (
              <ActivityIndicator size="small" color="rgb(var(--color-text-primary))" />
            ) : (
              <Text className="text-base font-medium text-button-primary-text">
                {isNewAccount
                  ? t('accountBottomSheet.actions.createAccount')
                  : isImport
                  ? t('accountBottomSheet.actions.importWallet')
                  : t('accountBottomSheet.actions.unlock')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </BottomSheetView>
  );
};

export default UnlockScreen;
