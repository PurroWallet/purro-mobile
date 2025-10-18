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
import { useZodForm, ZodFormValues } from '@/hooks/form/useZodForm';
import type { ImportSeedPhraseScreenProps } from '@/types/navigation';

const importSeedPhraseSchema = z.object({
  mnemonic: z.string().min(1, 'Seed phrase is required'),
}).refine((data) => {
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
        throw new Error('Invalid seed phrase. Must be exactly 12 words.');
      }

      // Navigate to password creation screen with the validated mnemonic
      navigation.navigate('CreatePassword', { mnemonic: values.mnemonic.trim() });
    } catch (error) {
      console.error('Error validating seed phrase:', error);
      Alert.alert(
        'Invalid Seed Phrase',
        error instanceof Error ? error.message : 'Failed to validate seed phrase. Please try again.',
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
            Import Seed Phrase
          </Text>
          <Text className="text-button text-text-secondary mb-8">
            Enter your 12-word seed phrase to restore your wallet
          </Text>

          <FormProvider {...form}>
            <View className="gap-4">
              <FormInput
                name="mnemonic"
                label="Seed Phrase"
                placeholder="Enter your seed phrase (12 words)"
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
              How to enter your seed phrase:
            </Text>
            <Text className="text-[14px] leading-[20px] text-text-secondary">
              • Enter each word separated by a space{'\n'}
              • Make sure all words are spelled correctly{'\n'}
              • Include all words in the correct order{'\n'}
              • Double-check before importing
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
            {isImporting ? 'Validating...' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ImportSeedPhraseScreen;