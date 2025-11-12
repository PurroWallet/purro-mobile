import { BottomSheetView } from '@gorhom/bottom-sheet';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Wallet } from 'ethers';
import React, { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { Alert, Text, View } from 'react-native';
import { z } from 'zod';
import { Button, FormInput } from '@/components';
import { walletController } from '@/core/controllers/WalletController';
import { useZodForm, ZodFormValues } from '@/core/hooks/form/useZodForm';
import type { AccountStackParamList } from '../AccountStackNavigator';
import BaseScreen from '../components/BaseScreen';

const importPrivateKeySchema = z.object({
  privateKey: z.string().min(1, 'Private key is required'),
});

type ImportPrivateKeyFormValues = ZodFormValues<typeof importPrivateKeySchema>;

type Props = {
  onClose: () => void;
};

const ImportPrivateKeyScreen: React.FC<Props> = ({ onClose }) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AccountStackParamList, 'ImportPrivateKey'>>();
  const [isImporting, setIsImporting] = useState(false);

  const form = useZodForm(importPrivateKeySchema, {
    defaultValues: {
      privateKey: '',
    },
    mode: 'onChange',
  });

  const isValid = form.formState.isValid;
  const privateKey = form.watch('privateKey');
  const errors = form.formState.errors;

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

        // Navigate to password verification screen first
        navigation.navigate('PasswordVerification', {
          accountAddress: '',
          onSuccess: async (verifiedPassword) => {
            // After password verification, directly import with verified password
            try {
              console.log('🔑 ImportPrivateKey - Direct import with verified password');
              const addresses = await walletController.importWalletWithPrivateKey(
                '0x' + privateKey,
              );
              console.log('🔑 ImportPrivateKey - Success, addresses:', addresses);

              // Navigate to success screen
              navigation.navigate('Success', {
                title: 'Import Successful!',
                message: 'Private key has been imported successfully.',
                buttonText: 'Done',
              });
            } catch (error) {
              console.error('🔑 ImportPrivateKey - Import failed:', error);
              Alert.alert('Import Failed', 'Failed to import private key. Please try again.', [
                { text: 'OK' },
              ]);
            }
          },
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

  const renderFooter = () => (
    <View className="absolute bottom-10 w-full px-6">
      <Button
        type="primary"
        title={isImporting ? 'Importing...' : 'Import Wallet'}
        onPress={handleSubmit}
        disabled={!isValid || isImporting}
        className="w-full"
      />
    </View>
  );

  return (
    <BaseScreen
      title="Import Private Key"
      showBackButton={true}
      onBack={() => navigation.goBack()}
      footer={renderFooter()}
    >
      <BottomSheetView className="w-full px-5">
        <View className="py-4">
          <Text className="text-lg text-[#F9F9F9] mb-2">Import Private Key</Text>
          <Text className="text-sm text-[#8D94A3] mb-6">
            Enter your private key to import a single address wallet
          </Text>

          <FormProvider {...form}>
            <View className="gap-2.5">
              <FormInput
                name="privateKey"
                label="Private Key"
                placeholder="Enter your private key (64 hex characters)"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                helperText={errors.privateKey?.message}
              />
            </View>
          </FormProvider>

          <View className="mt-6 rounded-xl bg-[rgba(255,107,107,0.1)] p-4">
            <Text className="mb-2 text-sm font-semibold text-[#FF6B6B]">⚠️ Security Warning</Text>
            <Text className="text-sm leading-5 text-[#8D94A3]">
              • Private keys give full control over your wallet{'\n'}• Never share your private key
              with anyone{'\n'}• Import only from trusted sources{'\n'}• Consider using seed phrase
              import instead
            </Text>
          </View>
        </View>
      </BottomSheetView>
    </BaseScreen>
  );
};

export default ImportPrivateKeyScreen;
