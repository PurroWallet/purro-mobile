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
import { Wallet } from 'ethers';
import type { ImportPrivateKeyScreenProps } from '@/types/navigation';

const importPrivateKeySchema = z.object({
  privateKey: z.string().min(1, 'Private key is required'),
});

type ImportPrivateKeyFormValues = ZodFormValues<typeof importPrivateKeySchema>;

const ImportPrivateKeyScreen: React.FC<ImportPrivateKeyScreenProps> = ({ navigation }) => {
  const [isImporting, setIsImporting] = useState(false);

  const form = useZodForm(importPrivateKeySchema, {
    defaultValues: {
      privateKey: '',
    },
    mode: 'onChange',
  });

  const isValid = form.formState.isValid;

  const handleImport = async (values: ImportPrivateKeyFormValues) => {
    if (isImporting) return;
    
    setIsImporting(true);
    try {
      // Validate private key format
      let privateKey = values.privateKey.trim();
      
      // Remove 0x prefix if present
      if (privateKey.startsWith('0x')) {
        privateKey = privateKey.slice(2);
      }
      
      // Check if it's a valid hex string of 64 characters (32 bytes)
      if (!/^[a-fA-F0-9]{64}$/.test(privateKey)) {
        throw new Error('Invalid private key format. Must be 64 hexadecimal characters.');
      }
      
      // Try to create a wallet from the private key to validate it
      try {
        const wallet = new Wallet('0x' + privateKey);
        if (!wallet.address) {
          throw new Error('Invalid private key.');
        }
        
        // Create a synthetic mnemonic for private key import
        // This is needed for the current wallet architecture
        const syntheticMnemonic = `PRIVATE_KEY:${privateKey}:${wallet.address}`;
        
        // Navigate to password creation screen with the synthetic mnemonic
        navigation.navigate('CreatePassword', {
          mnemonic: syntheticMnemonic,
          isPrivateKeyImport: true,
        });
      } catch {
        throw new Error('Invalid private key. Please check your input.');
      }
    } catch (error) {
      console.error('Error importing private key:', error);
      Alert.alert(
        'Import Failed',
        error instanceof Error ? error.message : 'Failed to import private key. Please try again.',
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
            Import Private Key
          </Text>
          <Text className="text-button text-text-secondary mb-8">
            Enter your private key to import a single address wallet
          </Text>

          <FormProvider {...form}>
            <View className="gap-4">
              <FormInput
                name="privateKey"
                label="Private Key"
                placeholder="Enter your private key (64 hex characters)"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
              

            </View>
          </FormProvider>

          <View className="mt-6 rounded-xl bg-[rgba(255,107,107,0.1)] p-4">
            <Text className="mb-2 text-[14px] font-semibold text-[#FF6B6B]">
              ⚠️ Security Warning
            </Text>
            <Text className="text-[14px] leading-[20px] text-text-secondary">
              • Private keys give full control over your wallet{'\n'}
              • Never share your private key with anyone{'\n'}
              • Import only from trusted sources{'\n'}
              • Consider using seed phrase import instead
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
            {isImporting ? 'Importing...' : 'Import Wallet'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ImportPrivateKeyScreen;