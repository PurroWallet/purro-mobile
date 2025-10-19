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
import { useZodForm, ZodFormValues } from '@/core/hooks/form/useZodForm';
import { Wallet } from 'ethers';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AccountStackParamList } from '../AccountStackNavigator';
import SheetHeader from '../components/SheetHeader';

const importPrivateKeySchema = z.object({
  privateKey: z.string().min(1, 'Private key is required'),
});

type ImportPrivateKeyFormValues = ZodFormValues<typeof importPrivateKeySchema>;

type Props = NativeStackScreenProps<
  AccountStackParamList,
  'ImportPrivateKey'
> & {
  onClose: () => void;
  parentNavigation: any;
};

const ImportPrivateKeyScreen: React.FC<Props> = ({
  navigation,
  onClose,
  parentNavigation,
}) => {
  const [isImporting, setIsImporting] = useState(false);

  const form = useZodForm(importPrivateKeySchema, {
    defaultValues: {
      privateKey: '',
    },
    mode: 'onChange',
  });

  const isValid = form.formState.isValid;
  const privateKey = form.watch('privateKey');

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
        throw new Error(
          'Invalid private key format. Must be 64 hexadecimal characters.',
        );
      }

      // Try to create a wallet from the private key to validate it
      try {
        const wallet = new Wallet('0x' + privateKey);
        if (!wallet.address) {
          throw new Error('Invalid private key.');
        }

        // Navigate to unlock screen with the private key
        navigation.navigate('Unlock', {
          mnemonic: '0x' + privateKey,
          isImport: true,
          isPrivateKeyImport: true,
        });
      } catch {
        throw new Error('Invalid private key. Please check your input.');
      }
    } catch (error) {
      console.error('Error importing private key:', error);
      Alert.alert(
        'Import Failed',
        error instanceof Error
          ? error.message
          : 'Failed to import private key. Please try again.',
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
        title="Import Private Key"
        onBack={() => navigation.goBack()}
      />
      <View className="mb-4" />

      <ScrollView className="flex-1 px-5">
        <View className="py-2">
          <Text className="text-lg text-[#F9F9F9] mb-2">
            Import Private Key
          </Text>
          <Text className="text-sm text-[#8D94A3] mb-6">
            Enter your private key to import a single address wallet
          </Text>

          <FormProvider {...form}>
            <View className="gap-2.5">
              <View className="rounded-xl border border-[#494F5B] px-4 py-4">
                <TextInput
                  value={form.watch('privateKey')}
                  onChangeText={text => form.setValue('privateKey', text)}
                  placeholder="Enter your private key (64 hex characters)"
                  placeholderTextColor="#8D94A3"
                  className="text-lg text-[#F9F9F9]"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
              </View>
            </View>
          </FormProvider>

          <View className="mt-6 rounded-xl bg-[rgba(255,107,107,0.1)] p-4">
            <Text className="mb-2 text-sm font-semibold text-[#FF6B6B]">
              ⚠️ Security Warning
            </Text>
            <Text className="text-sm leading-5 text-[#8D94A3]">
              • Private keys give full control over your wallet{'\n'}• Never
              share your private key with anyone{'\n'}• Import only from trusted
              sources{'\n'}• Consider using seed phrase import instead
            </Text>
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-10 w-full px-6">
        <TouchableOpacity
          className={`w-full min-h-12 items-center justify-center rounded-xl px-6 py-4 ${
            !privateKey || privateKey.trim().length < 64 || isImporting
              ? 'bg-[#373B43]'
              : 'bg-[#059288]'
          }`}
          onPress={handleSubmit}
          disabled={!privateKey || privateKey.trim().length < 64 || isImporting}
        >
          <Text
            className={`text-base font-medium ${
              !privateKey || privateKey.trim().length < 64 || isImporting
                ? 'text-[#8D94A3]'
                : 'text-[#F9F9F9]'
            }`}
          >
            {isImporting ? 'Importing...' : 'Import Wallet'}
          </Text>
        </TouchableOpacity>
      </View>
    </BottomSheetView>
  );
};

export default ImportPrivateKeyScreen;
