import React from 'react';
import { FormProvider } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, PasswordInputForm } from '@/components';
import { Icon } from '@/components/Icon';
import { useCreatePasswordScreen } from '../hooks/useCreatePasswordScreen';

export const CreatePasswordContent: React.FC = () => {
  const { form, strings, isLoading, isSubmitDisabled, onBackPress, onSubmit } =
    useCreatePasswordScreen();

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-1 px-5 justify-between">
          <View className="flex-row items-center justify-between mb-6">
            <View className="p-2" onTouchEnd={onBackPress}>
              <Icon name="ChevronLeft" size={24} />
            </View>
            <Text className="text-h4 text-text-primary">{strings.headerTitle}</Text>
            <View className="w-10" />
          </View>

          <View className="flex-1">
            <Text className="text-button text-text-secondary mb-8">{strings.subtitle}</Text>

            <FormProvider {...form}>
              <View className="mb-5">
                <PasswordInputForm
                  name="password"
                  label={strings.passwordLabel}
                  placeholder={strings.passwordPlaceholder}
                  autoComplete="password"
                  textContentType="password"
                />
              </View>

              <View className="mb-5">
                <PasswordInputForm
                  name="confirmPassword"
                  label={strings.confirmLabel}
                  placeholder={strings.confirmPlaceholder}
                  autoComplete="password"
                  textContentType="password"
                />
              </View>
            </FormProvider>
          </View>

          <View className="px-5 pb-5">
            <Button
              type="primary"
              title={isLoading ? strings.buttonLoading : strings.buttonSubmit}
              onPress={onSubmit}
              disabled={isSubmitDisabled}
              className="w-full"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
