import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { FormProvider } from 'react-hook-form';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, FormInput } from '@/components';
import type {
  ImportPrivateKeyFormValues,
  ImportPrivateKeyStrings,
} from '../hooks/useImportPrivateKeyScreen';

interface ImportPrivateKeyContentProps {
  form: UseFormReturn<ImportPrivateKeyFormValues>;
  strings: ImportPrivateKeyStrings;
  isImporting: boolean;
  isSubmitDisabled: boolean;
  onSubmit: () => void;
}

export const ImportPrivateKeyContent: React.FC<ImportPrivateKeyContentProps> = ({
  form,
  strings,
  isImporting,
  isSubmitDisabled,
  onSubmit,
}) => (
  <SafeAreaView className="flex-1 bg-primary">
    <ScrollView className="flex-1 px-5">
      <View className="py-5">
        <Text className="text-h4 text-text-primary mb-2">{strings.title}</Text>
        <Text className="text-button text-text-secondary mb-8">{strings.subtitle}</Text>

        <FormProvider {...form}>
          <View className="gap-4">
            <FormInput
              name="privateKey"
              label={strings.formLabel}
              placeholder={strings.formPlaceholder}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={onSubmit}
            />
          </View>
        </FormProvider>

        <View className="mt-6 rounded-xl bg-[rgba(255,107,107,0.1)] p-4">
          <Text className="mb-2 text-[14px] font-semibold text-[#FF6B6B]">
            {strings.warningTitle}
          </Text>
          <Text className="text-[14px] leading-[20px] text-text-secondary">
            {strings.warningDescription}
          </Text>
        </View>
      </View>
    </ScrollView>

    <View className="px-5 pb-5">
      <Button
        type="primary"
        title={isImporting ? strings.buttonLoading : strings.buttonSubmit}
        onPress={onSubmit}
        disabled={isSubmitDisabled}
      />
    </View>
  </SafeAreaView>
);
