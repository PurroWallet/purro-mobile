import { BottomSheetView } from '@gorhom/bottom-sheet';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { z } from 'zod';
import { Button, PasswordInputForm } from '@/components';
import { apisLock } from '@/core/apis';
import { useZodForm, ZodFormValues } from '@/core/hooks/form/useZodForm';
import { useTranslation } from '@/utils/i18n';
import type { AccountStackParamList } from '../AccountStackNavigator';
import BaseScreen from '../components/BaseScreen';

const passwordVerificationSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

type PasswordVerificationFormValues = ZodFormValues<typeof passwordVerificationSchema>;

interface RouteParams {
  accountAddress: string;
  onSuccess: (password: string) => void;
}

const PasswordVerificationScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AccountStackParamList, 'PasswordVerification'>>();
  const route = useRoute<RouteProp<AccountStackParamList, 'PasswordVerification'>>();
  const { accountAddress, onSuccess } = (route.params || {}) as RouteParams;
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const form = useZodForm(passwordVerificationSchema, {
    defaultValues: {
      password: '',
    },
    mode: 'onChange',
  });

  const passwordValue = form.watch('password') ?? '';
  const isValid = form.formState.isValid;

  const handleVerify = async (values: PasswordVerificationFormValues) => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      console.log('🔐 PasswordVerification - Starting verification...');
      console.log('🔐 PasswordVerification - Password provided:', !!values.password);

      // Verify password
      const result = await apisLock.verifyPassword(values.password);

      console.log('🔐 PasswordVerification - Result:', result);

      if (result.success) {
        console.log('✅ PasswordVerification - Password correct, calling onSuccess...');
        // Password is correct, call onSuccess callback with password
        onSuccess(values.password);
      } else {
        console.log('❌ PasswordVerification - Password incorrect');
        form.setError('password', {
          message: t('accountBottomSheet.errors.incorrectPassword'),
        });
      }
    } catch (error) {
      console.log('💥 PasswordVerification - Error:', error);
      form.setError('password', {
        message: t('accountBottomSheet.errors.verifyPasswordFailed'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    form.handleSubmit(handleVerify)();
  };

  const renderFooter = () => (
    <View className="absolute bottom-10 w-full px-6">
      <Button
        type="primary"
        title={
          isLoading
            ? t('accountBottomSheet.verifyActions.loading')
            : t('accountBottomSheet.verifyActions.submit')
        }
        onPress={handleSubmit}
        disabled={!isValid || isLoading}
        className="w-full"
      />
    </View>
  );

  return (
    <BaseScreen
      title={t('accountBottomSheet.verifyPasswordTitle')}
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
            <Text className="text-lg text-[#F9F9F9] mb-2">
              {t('accountBottomSheet.verifyPasswordSubtitle')}
            </Text>
            <Text className="mb-6 text-sm text-text-secondary">
              {t('accountBottomSheet.verifyPasswordDescription')}
            </Text>

            <FormProvider {...form}>
              <View className="mb-4">
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

export default PasswordVerificationScreen;
