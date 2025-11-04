import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { FormProvider } from 'react-hook-form';
import { StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, PasswordInputForm } from '@/components';
import type {
  SeedPhraseBackupFormValues,
  SeedPhraseBackupStrings,
} from '../hooks/useSeedPhraseBackupScreen';

interface SeedPhraseBackupContentProps {
  form: UseFormReturn<SeedPhraseBackupFormValues>;
  strings: SeedPhraseBackupStrings;
  isUnlocking: boolean;
  isSubmitDisabled: boolean;
  onSubmit: () => void;
}

export const SeedPhraseBackupContent: React.FC<SeedPhraseBackupContentProps> = ({
  form,
  strings,
  isUnlocking,
  isSubmitDisabled,
  onSubmit,
}) => (
  <SafeAreaView className="flex-1 bg-primary">
    <StatusBar barStyle="light-content" backgroundColor="#161616" />

    <View className="flex-1 items-center justify-between px-5 py-5">
      <View className="w-full gap-8 pt-16">
        <View className="items-center gap-4">
          <Text className="w-[335px] text-center text-h4 text-text-primary">{strings.title}</Text>
          <Text className="w-[335px] text-center text-button text-text-secondary">
            {strings.subtitle}
          </Text>
        </View>

        <FormProvider {...form}>
          <View className="w-full gap-4">
            <PasswordInputForm
              name="password"
              label={strings.formLabel}
              placeholder={strings.formPlaceholder}
              secureTextEntry
              autoCapitalize="none"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={onSubmit}
            />
          </View>
        </FormProvider>

        <View className="rounded-xl bg-[rgba(255,107,107,0.1)] p-4">
          <Text className="mb-2 text-[14px] font-semibold text-[#FF6B6B]">
            {strings.warningTitle}
          </Text>
          <Text className="text-[14px] leading-[20px] text-text-secondary">
            {strings.warningDescription}
          </Text>
        </View>
      </View>

      <View className="w-full gap-4">
        <Button
          type="primary"
          title={isUnlocking ? strings.buttonLoading : strings.buttonSubmit}
          onPress={onSubmit}
          disabled={isSubmitDisabled}
        />
      </View>
    </View>
  </SafeAreaView>
);
