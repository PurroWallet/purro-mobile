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
import { apisWallet } from '@/core/apis';
import type { ImportWalletScreenProps } from '@/types/navigation';

const importWalletSchema = z.object({
  mnemonic: z.string().min(1, 'Seed phrase is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['confirmPassword'],
      message: 'Passwords do not match',
    });
  }
});

type ImportWalletFormValues = ZodFormValues<typeof importWalletSchema>;

const ImportWalletScreen: React.FC<ImportWalletScreenProps> = ({ navigation }) => {
  const [isImporting, setIsImporting] = useState(false);

  const form = useZodForm(importWalletSchema, {
    defaultValues: {
      mnemonic: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const { setFocus } = form;
  const isValid = form.formState.isValid;

  const handleImport = async (values: ImportWalletFormValues) => {
    if (isImporting) return;
    
    setIsImporting(true);
    try {
      // Validate mnemonic format
      const words = values.mnemonic.trim().split(/\s+/);
      if (words.length !== 12 && words.length !== 24) {
        throw new Error('Invalid seed phrase. Must be 12 or 24 words.');
      }

      // Import wallet
      await apisWallet.importWallet(values.mnemonic.trim(), values.password);
      
      // Navigate to success screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.error('Error importing wallet:', error);
      Alert.alert(
        'Import Failed',
        error instanceof Error ? error.message : 'Failed to import wallet. Please check your seed phrase and try again.',
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
            Import Wallet
          </Text>
          <Text className="text-button text-text-secondary mb-8">
            Enter your 12 or 24-word seed phrase to restore your wallet
          </Text>

          <FormProvider {...form}>
            <View className="gap-4">
              <FormInput
                name="mnemonic"
                label="Seed Phrase"
                placeholder="Enter your seed phrase (12 or 24 words)"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => setFocus('password')}
              />

              <FormInput
                name="password"
                label="Password"
                placeholder="Create a password"
                secureTextEntry
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => setFocus('confirmPassword')}
              />

              <FormInput
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Confirm your password"
                secureTextEntry
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>
          </FormProvider>
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
            {isImporting ? 'Importing...' : 'Import Wallet'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ImportWalletScreen;