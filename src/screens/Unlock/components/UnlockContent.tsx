import React from 'react';
import { FormProvider } from 'react-hook-form';
import { StatusBar, Text, View } from 'react-native';
import { Button, PasswordInputForm } from '@/components';
import KeyboardAvoidingView from '@/components/KeyboardAvoidingView';
import { useUnlockScreen } from '../hooks/useUnlockScreen';

export const UnlockContent: React.FC = () => {
  const { form, strings, isDisabled, onSubmit } = useUnlockScreen();

  return (
    <KeyboardAvoidingView>
      <StatusBar barStyle="light-content" backgroundColor="#161616" />

      <View className="flex-1 items-center justify-center px-5">
        <View className="mb-8 h-[120px] w-[120px] rounded-[60px] bg-primary" />
        <Text className="text-center text-h4 text-primary">{strings.title}</Text>
      </View>

      <View className="px-5 pb-10">
        <FormProvider {...form}>
          <View className="gap-4">
            <PasswordInputForm
              name="password"
              label={strings.formLabel}
              placeholder={strings.formPlaceholder}
              autoCapitalize="none"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={onSubmit}
            />

            <Button
              type="primary"
              title={strings.submit}
              onPress={onSubmit}
              disabled={isDisabled}
            />
          </View>
        </FormProvider>
      </View>
    </KeyboardAvoidingView>
  );
};
