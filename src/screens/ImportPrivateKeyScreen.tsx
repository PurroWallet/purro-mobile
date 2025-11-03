import { useNavigation } from '@react-navigation/native';
import { Wallet } from 'ethers';
import React, { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';
import { Button, FormInput } from '@/components';
import { useZodForm, ZodFormValues } from '@/core/hooks/form/useZodForm';
import type { NavigationProp } from '@/types/navigation';
import { useTranslation } from '@/utils/i18n';

const importPrivateKeySchema = z.object({
  privateKey: z.string().min(1, 'Private key is required'),
});

type ImportPrivateKeyFormValues = ZodFormValues<typeof importPrivateKeySchema>;

const ImportPrivateKeyScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<'ImportPrivateKey'>>();
  const [isImporting, setIsImporting] = useState(false);
  const { t } = useTranslation();

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
        throw new Error(t('importPrivateKey.errors.invalidFormat'));
      }

      // Try to create a wallet from the private key to validate it
      try {
        const wallet = new Wallet('0x' + privateKey);
        if (!wallet.address) {
          throw new Error(t('importPrivateKey.errors.invalidKey'));
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
        throw new Error(t('importPrivateKey.errors.invalidKey'));
      }
    } catch (error) {
      console.error('Error importing private key:', error);
      Alert.alert(
        t('importPrivateKey.alert.title'),
        error instanceof Error ? error.message : t('importPrivateKey.alert.generic'),
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
          <Text className="text-h4 text-text-primary mb-2">{t('importPrivateKey.title')}</Text>
          <Text className="text-button text-text-secondary mb-8">
            {t('importPrivateKey.subtitle')}
          </Text>

          <FormProvider {...form}>
            <View className="gap-4">
              <FormInput
                name="privateKey"
                label={t('importPrivateKey.form.label')}
                placeholder={t('importPrivateKey.form.placeholder')}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>
          </FormProvider>

          <View className="mt-6 rounded-xl bg-[rgba(255,107,107,0.1)] p-4">
            <Text className="mb-2 text-[14px] font-semibold text-[#FF6B6B]">
              {t('importPrivateKey.warning.title')}
            </Text>
            <Text className="text-[14px] leading-[20px] text-text-secondary">
              {t('importPrivateKey.warning.description')}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View className="px-5 pb-5">
        <Button
          type="primary"
          title={
            isImporting
              ? t('importPrivateKey.actions.loading')
              : t('importPrivateKey.actions.submit')
          }
          onPress={handleSubmit}
          disabled={!isValid || isImporting}
        />
      </View>
    </SafeAreaView>
  );
};

export default ImportPrivateKeyScreen;
