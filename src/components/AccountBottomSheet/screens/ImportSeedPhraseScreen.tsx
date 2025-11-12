import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { Alert, Text, View } from 'react-native';
import { z } from 'zod';
import { Button, FormInput } from '@/components';
import { apisLock } from '@/core/apis';
import { walletController } from '@/core/controllers/WalletController';
import { useZodForm, ZodFormValues } from '@/core/hooks/form/useZodForm';
import type { AccountStackParamList } from '../AccountStackNavigator';
import BaseScreen from '../components/BaseScreen';

const importSeedPhraseSchema = z
  .object({
    mnemonic: z.string().min(1, 'Seed phrase is required'),
  })
  .refine(
    (data) => {
      const words = data.mnemonic.trim().split(/\s+/);
      // Check if it's exactly 12 words
      if (words.length !== 12) {
        return false;
      }
      // Basic validation - check if words contain only letters
      return words.every((word) => /^[a-zA-Z]+$/.test(word));
    },
    {
      message: 'Invalid seed phrase. Must be exactly 12 words.',
    },
  );

type ImportSeedPhraseFormValues = ZodFormValues<typeof importSeedPhraseSchema>;

type Props = {
  onClose: () => void;
};

const ImportSeedPhraseScreen: React.FC<Props> = ({ onClose }) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AccountStackParamList, 'ImportSeedPhrase'>>();
  const [isImporting, setIsImporting] = useState(false);

  const form = useZodForm(importSeedPhraseSchema, {
    defaultValues: {
      mnemonic: '',
    },
    mode: 'onChange',
  });

  const isValid = form.formState.isValid;
  const mnemonic = form.watch('mnemonic');
  const errors = form.formState.errors;

  const handleImport = async (values: ImportSeedPhraseFormValues) => {
    if (isImporting) return;

    setIsImporting(true);
    try {
      // Validate mnemonic format
      const mnemonicWords = values.mnemonic.trim().split(/\s+/);
      if (mnemonicWords.length !== 12) {
        throw new Error('Invalid seed phrase. Must be exactly 12 words.');
      }

      // Navigate to password verification screen first
      navigation.navigate('PasswordVerification', {
        accountAddress: '',
        onSuccess: async (verifiedPassword) => {
          // After password verification, navigate to discovery screen
          try {
            console.log('📥 ImportSeedPhrase: Starting discovery with verified password...');
            console.log('📝 Mnemonic:', values.mnemonic.trim().substring(0, 30) + '...');
            console.log('🔑 Password verified');

            // Navigate to seed phrase discovery screen with loading animation
            navigation.navigate('SeedPhraseDiscovery', {
              mnemonic: values.mnemonic.trim(),
              password: verifiedPassword,
              onSuccess: (account: any) => {
                console.log(
                  '📥 ImportSeedPhrase: Account created callback for:',
                  account.address.substring(0, 10) + '...',
                );
              },
            });
          } catch (error) {
            console.error('📥 ImportSeedPhrase - Discovery failed:', error);
            Alert.alert('Import Failed', 'Failed to start account discovery. Please try again.', [
              { text: 'OK' },
            ]);
          }
        },
      });
    } catch (error) {
      console.error('Error importing seed phrase:', error);
      Alert.alert(
        'Import Failed',
        error instanceof Error ? error.message : 'Failed to import seed phrase. Please try again.',
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleSubmit = () => {
    form.handleSubmit(handleImport)();
  };

  const renderFooter = () => (
    <View className="absolute bottom-10 w-full px-6">
      <Button
        type="primary"
        title={isImporting ? 'Validating...' : 'Continue'}
        onPress={handleSubmit}
        disabled={!isValid || isImporting}
        className="w-full"
      />
    </View>
  );

  return (
    <BaseScreen
      title="Import Seed Phrase"
      showBackButton={true}
      onBack={() => navigation.goBack()}
      footer={renderFooter()}
      isScrollable={true}
    >
      <BottomSheetScrollView className="w-full px-5" contentContainerClassName="pb-10">
        <View className="py-2">
          <Text className="text-lg text-[#F9F9F9] mb-2">Import Seed Phrase</Text>
          <Text className="text-sm text-[#8D94A3] mb-6">
            Enter your 12-word seed phrase to restore your wallet
          </Text>

          <FormProvider {...form}>
            <View className="gap-2.5">
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
                helperText={errors.mnemonic?.message}
              />
            </View>
          </FormProvider>

          <View className="mt-6 rounded-xl bg-[#373B43]/60 p-4">
            <Text className="mb-2 text-sm font-semibold text-[#F9F9F9]">
              How to enter your seed phrase:
            </Text>
            <Text className="text-sm leading-5 text-[#8D94A3]">
              • Enter each word separated by a space{'\n'}• Make sure all words are spelled
              correctly{'\n'}• Include all words in the correct order{'\n'}• Double-check before
              importing
            </Text>
          </View>
        </View>
      </BottomSheetScrollView>
    </BaseScreen>
  );
};

export default ImportSeedPhraseScreen;
