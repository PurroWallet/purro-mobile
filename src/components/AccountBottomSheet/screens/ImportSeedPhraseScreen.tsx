import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { useZodForm, ZodFormValues } from '@/hooks/form/useZodForm';
import { walletController } from '@/core/controllers/WalletController';
import { apisLock } from '@/core/apis';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AccountStackParamList } from '../AccountStackNavigator';
import SheetHeader from '../components/SheetHeader';

const importSeedPhraseSchema = z
  .object({
    mnemonic: z.string().min(1, 'Seed phrase is required'),
  })
  .refine(
    data => {
      const words = data.mnemonic.trim().split(/\s+/);
      // Check if it's exactly 12 words
      if (words.length !== 12) {
        return false;
      }
      // Basic validation - check if words contain only letters
      return words.every(word => /^[a-zA-Z]+$/.test(word));
    },
    {
      message: 'Invalid seed phrase. Must be exactly 12 words.',
    },
  );

type ImportSeedPhraseFormValues = ZodFormValues<typeof importSeedPhraseSchema>;

type Props = NativeStackScreenProps<
  AccountStackParamList,
  'ImportSeedPhrase'
> & {
  onClose: () => void;
  parentNavigation: any;
};

const ImportSeedPhraseScreen: React.FC<Props> = ({
  navigation,
  onClose,
  parentNavigation,
}) => {
  const [isImporting, setIsImporting] = useState(false);

  const form = useZodForm(importSeedPhraseSchema, {
    defaultValues: {
      mnemonic: '',
    },
    mode: 'onChange',
  });

  const isValid = form.formState.isValid;
  const mnemonic = form.watch('mnemonic');

  const handleImport = async (values: ImportSeedPhraseFormValues) => {
    if (isImporting) return;

    setIsImporting(true);
    try {
      // Validate mnemonic format
      const mnemonicWords = values.mnemonic.trim().split(/\s+/);
      if (mnemonicWords.length !== 12) {
        throw new Error('Invalid seed phrase. Must be exactly 12 words.');
      }

      // Navigate to unlock screen with the validated mnemonic
      navigation.navigate('Unlock', {
        mnemonic: values.mnemonic.trim(),
        isImport: true,
      });
    } catch (error) {
      console.error('Error importing seed phrase:', error);
      Alert.alert(
        'Import Failed',
        error instanceof Error
          ? error.message
          : 'Failed to import seed phrase. Please try again.',
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleSubmit = () => {
    form.handleSubmit(handleImport)();
  };

  return (
    <BottomSheetView className="flex-1">
      {/* Header */}
      <SheetHeader
        title="Import Seed Phrase"
        onBack={() => navigation.goBack()}
      />
      <View className="mb-4" />

      <ScrollView className="flex-1 px-5">
        <View className="py-2">
          <Text className="text-lg text-[#F9F9F9] mb-2">
            Import Seed Phrase
          </Text>
          <Text className="text-sm text-[#8D94A3] mb-6">
            Enter your 12-word seed phrase to restore your wallet
          </Text>

          <FormProvider {...form}>
            <View className="gap-2.5">
              <View className="rounded-xl border border-[#494F5B] px-4 py-4">
                <TextInput
                  value={form.watch('mnemonic')}
                  onChangeText={text => form.setValue('mnemonic', text)}
                  placeholder="Enter your seed phrase (12 words)"
                  placeholderTextColor="#8D94A3"
                  className="text-lg text-[#F9F9F9]"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
              </View>
            </View>
          </FormProvider>

          <View className="mt-6 rounded-xl bg-[#373B43]/60 p-4">
            <Text className="mb-2 text-sm font-semibold text-[#F9F9F9]">
              How to enter your seed phrase:
            </Text>
            <Text className="text-sm leading-5 text-[#8D94A3]">
              • Enter each word separated by a space{'\n'}• Make sure all words
              are spelled correctly{'\n'}• Include all words in the correct
              order{'\n'}• Double-check before importing
            </Text>
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-10 w-full px-6">
        <TouchableOpacity
          className={`w-full min-h-12 items-center justify-center rounded-xl px-6 py-4 ${
            !mnemonic ||
            mnemonic.trim().split(/\s+/).length !== 12 ||
            isImporting
              ? 'bg-[#373B43]'
              : 'bg-[#059288]'
          }`}
          onPress={handleSubmit}
          disabled={
            !mnemonic ||
            mnemonic.trim().split(/\s+/).length !== 12 ||
            isImporting
          }
        >
          <Text
            className={`text-base font-medium ${
              !mnemonic ||
              mnemonic.trim().split(/\s+/).length !== 12 ||
              isImporting
                ? 'text-[#8D94A3]'
                : 'text-[#F9F9F9]'
            }`}
          >
            {isImporting ? 'Validating...' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </BottomSheetView>
  );
};

export default ImportSeedPhraseScreen;
