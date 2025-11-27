import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { z } from 'zod';
import { Button, PasswordInputForm } from '@/components';
import { apisKeychain, apisLock } from '@/core/apis';
import { useBiometrics } from '@/core/hooks/biometrics';
import { useZodForm, ZodFormValues } from '@/core/hooks/form/useZodForm';
import { keyringService } from '@/core/services';
import { KEYCHAIN_AUTH_TYPES } from '@/core/services/keychain';
import { useTranslation } from '@/utils/i18n';
import type { AccountStackParamList } from '../AccountStackNavigator';
import BaseScreen from '../components/BaseScreen';

const changePasswordSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ChangePasswordFormValues = ZodFormValues<typeof changePasswordSchema>;

type RouteParams = {
  currentPassword: string;
};

const ChangePasswordScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AccountStackParamList, 'ChangePasswordScreen'>>();
  const route = useRoute();
  const { currentPassword } = route.params as RouteParams;
  const { t } = useTranslation();
  const {
    computed: { isBiometricsEnabled },
  } = useBiometrics();
  const [isChanging, setIsChanging] = useState(false);

  const form = useZodForm(changePasswordSchema, {
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const isValid = form.formState.isValid;

  const handleChangePassword = async (values: ChangePasswordFormValues) => {
    if (isChanging) return;

    setIsChanging(true);
    try {
      // Update the vault password (decrypts with old, re-encrypts with new)
      await keyringService.updatePassword(currentPassword, values.newPassword);

      // Update keychain with new password
      await apisKeychain.resetGenericPassword(); // Clear old
      await apisKeychain.setGenericPassword(
        values.newPassword,
        KEYCHAIN_AUTH_TYPES.APPLICATION_PASSWORD,
      );

      // Re-enable biometrics with new password if they were previously enabled
      if (isBiometricsEnabled) {
        await apisKeychain.setGenericPassword(values.newPassword, KEYCHAIN_AUTH_TYPES.BIOMETRICS);

        // Verify biometrics work with new password
        try {
          await apisKeychain.requestGenericPassword();
        } catch (error) {
          console.warn('Biometric verification failed after password change:', error);
        }
      }

      // Lock wallet for security
      await apisLock.lockWallet();

      Alert.alert(
        t('accountBottomSheet.settingsScreen.alerts.changePasswordScreen.successTitle'),
        t('accountBottomSheet.settingsScreen.alerts.changePasswordScreen.successMessage'),
        [
          {
            text: t('common.ok'),
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'AccountList' }],
              });
            },
          },
        ],
      );
    } catch (error) {
      Alert.alert(
        t('errors.generic.title'),
        t('accountBottomSheet.settingsScreen.alerts.changePasswordScreen.error'),
      );
    } finally {
      setIsChanging(false);
    }
  };

  const handleSubmit = () => {
    form.handleSubmit(handleChangePassword)();
  };

  const renderFooter = () => (
    <View className="absolute bottom-10 w-full px-6">
      <Button
        type="primary"
        title={
          isChanging
            ? t('common.loading')
            : t('accountBottomSheet.settingsScreen.alerts.changePasswordScreen.submit')
        }
        onPress={handleSubmit}
        disabled={!isValid || isChanging}
        className="w-full"
      />
    </View>
  );

  return (
    <BaseScreen
      title={t('accountBottomSheet.settingsScreen.alerts.changePasswordScreen.title')}
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
            <Text className="text-lg text-text-primary mb-2">
              {t('accountBottomSheet.settingsScreen.alerts.changePasswordScreen.title')}
            </Text>
            <Text className="mb-6 text-sm text-text-secondary">
              {t('accountBottomSheet.settingsScreen.alerts.changePasswordScreen.instructions')}
            </Text>

            <FormProvider {...form}>
              <View className="mb-4">
                <PasswordInputForm
                  name="newPassword"
                  label={t(
                    'accountBottomSheet.settingsScreen.alerts.changePasswordScreen.newPasswordPlaceholder',
                  )}
                  placeholder={t(
                    'accountBottomSheet.settingsScreen.alerts.changePasswordScreen.newPasswordPlaceholder',
                  )}
                  autoCapitalize="none"
                  autoComplete="password-new"
                  textContentType="password"
                  returnKeyType="next"
                />
              </View>
              <View className="mb-4">
                <PasswordInputForm
                  name="confirmPassword"
                  label={t(
                    'accountBottomSheet.settingsScreen.alerts.changePasswordScreen.confirmPasswordPlaceholder',
                  )}
                  placeholder={t(
                    'accountBottomSheet.settingsScreen.alerts.changePasswordScreen.confirmPasswordPlaceholder',
                  )}
                  autoCapitalize="none"
                  autoComplete="password-new"
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

export default ChangePasswordScreen;
