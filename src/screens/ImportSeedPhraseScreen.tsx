import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { FormInput } from '@/components';
import { useZodForm, ZodFormValues } from '@/core/hooks/form/useZodForm';
import type { ImportSeedPhraseScreenProps } from '@/types/navigation';
import { useTranslation } from '@/utils/i18n';

const importSeedPhraseSchema = z.object({
  mnemonic: z.string().min(1, 'Seed phrase is required'),
}).refine(data => {
  const words = data.mnemonic.trim().split(/\s+/);
  // Check if it's exactly 12 words
  if (words.length !== 12) {
    return false;
  }
  // Basic validation - check if words contain only letters
  return words.every(word => /^[a-zA-Z]+$/.test(word));
}, {
  message: 'Invalid seed phrase. Must be exactly 12 words.',
});

type ImportSeedPhraseFormValues = ZodFormValues<typeof importSeedPhraseSchema>;

const ImportSeedPhraseScreen: React.FC<ImportSeedPhraseScreenProps> = ({ navigation }) => {
  const [isImporting, setIsImporting] = useState(false);
  const { t } = useTranslation();

  const form = useZodForm(importSeedPhraseSchema, {
    defaultValues: {
      mnemonic: '',
    },
    mode: 'onChange',
  });

  const isValid = form.formState.isValid;

  const handleImport = async (values: ImportSeedPhraseFormValues) => {
    if (isImporting) return;
    
    setIsImporting(true);
    try {
      // Validate mnemonic format
      const mnemonicWords = values.mnemonic.trim().split(/\s+/);
      if (mnemonicWords.length !== 12) {
        throw new Error(t('importSeedPhrase.errors.invalidWords'));
      }

      // Navigate to password creation screen with the validated mnemonic
      navigation.navigate('CreatePassword', { mnemonic: values.mnemonic.trim() });
    } catch (error) {
      console.error('Error validating seed phrase:', error);
      Alert.alert(
        t('importSeedPhrase.alert.title'),
        error instanceof Error ? error.message : t('importSeedPhrase.alert.generic'),
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleSubmit = () => {
    form.handleSubmit(handleImport)();
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <ScrollView className="flex-1 px-5">
        <View className="py-5">
          <Text className="text-h4 text-text-primary mb-2">
            {t('importSeedPhrase.title')}
          </Text>
          <Text className="text-button text-text-secondary mb-8">
            {t('importSeedPhrase.subtitle')}
          </Text>

          <FormProvider {...form}>
            <View className="gap-4">
              <FormInput
                name="mnemonic"
                label={t('importSeedPhrase.form.label')}
                placeholder={t('importSeedPhrase.form.placeholder')}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>
          </FormProvider>

          <View className="mt-6 rounded-xl bg-[rgba(106,114,130,0.1)] p-4">
            <Text className="mb-2 text-[14px] font-semibold text-text-primary">
              {t('importSeedPhrase.guidelines.title')}
            </Text>
            <Text className="text-[14px] leading-[20px] text-text-secondary">
              {t('importSeedPhrase.guidelines.description')}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View className="px-5 pb-5">
        <TouchableOpacity
          className={`w-full min-h-12 items-center justify-center rounded-xl px-6 py-4 ${
            !isValid || isImporting ? 'bg-button-primary-disabled' : 'bg-brand-primary'
          }`}
          onPress={handleSubmit}
          disabled={!isValid || isImporting}
        >
          <Text
            className={`text-button ${
              !isValid || isImporting
                ? 'text-button-primary-disabled-text'
                : 'text-button-primary-text'
            }`}
          >
            {isImporting
              ? t('importSeedPhrase.actions.loading')
              : t('importSeedPhrase.actions.submit')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ImportSeedPhraseScreen;