import { BottomSheetView } from '@gorhom/bottom-sheet';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { z } from 'zod';
import { Button, PasswordInputForm } from '@/components';
import { apisLock } from '@/core/apis';
import { walletController } from '@/core/controllers/WalletController';
import { useZodForm, ZodFormValues } from '@/core/hooks/form/useZodForm';
import { useTranslation } from '@/utils/i18n';
import type { AccountStackParamList } from '../AccountStackNavigator';
import BaseScreen from '../components/BaseScreen';

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
  const { mnemonic, isImport, isPrivateKeyImport, isNewAccount } = (route.params ||
    {}) as RouteParams;

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
        form.setError('password', {
          message: t('accountBottomSheet.errors.incorrectPassword'),
        });
      } finally {
        setIsUnlocking(false);
      }
    },
    [isUnlocking, isNewAccount, isImport, isPrivateKeyImport, mnemonic, form, navigation],
  );

  const handleSubmit = () => {
    form.handleSubmit(handleUnlock)();
  };

  const isDisabled = !passwordValue.trim() || !isValid || isUnlocking;

  const renderFooter = () => (
    <View className="absolute bottom-10 w-full px-6">
      <Button
        type="primary"
        title={
          isUnlocking
            ? '...'
            : isNewAccount
              ? t('accountBottomSheet.actions.createAccount')
              : isImport
                ? t('accountBottomSheet.actions.importWallet')
                : t('accountBottomSheet.actions.unlock')
        }
        onPress={handleSubmit}
        disabled={!passwordValue.trim() || isUnlocking}
        className="w-full"
      />
    </View>
  );

  return (
    <BaseScreen
      title={t('accountBottomSheet.unlockTitle')}
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
                <PasswordInputForm
                  name="password"
                  label={t('accountBottomSheet.passwordLabel')}
                  placeholder={t('accountBottomSheet.passwordPlaceholder')}
                  autoCapitalize="none"
                  autoComplete="password"
                  textContentType="password"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
              </View>
            </FormProvider>
          </View>
        </View>
      </KeyboardAvoidingView>
    </BaseScreen>
  );
};

export default UnlockScreen;
