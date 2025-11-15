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
import { useTranslation } from '@/utils/i18n';
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
  const { t } = useTranslation();
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
          // After password verification, ensure wallet is unlocked and navigate to discovery
          try {
            // Unlock wallet (verifyPassword already confirmed password is correct)
            await walletController.unlock(verifiedPassword);

            // Navigate to seed phrase discovery screen with loading animation
            navigation.navigate('SeedPhraseDiscovery', {
              mnemonic: values.mnemonic.trim(),
              password: verifiedPassword,
              onSuccess: (account: any) => {
                // Handle successful account creation
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
        title={
          isImporting
            ? t('accountBottomSheet.createPassword.actions.loading')
            : t('common.continue')
        }
        onPress={handleSubmit}
        disabled={!isValid || isImporting}
        className="w-full"
      />
    </View>
  );

  return (
    <BaseScreen
      title={t('importMethods.seed.title')}
      showBackButton={true}
      onBack={() => navigation.goBack()}
      footer={renderFooter()}
      isScrollable={true}
    >
      <BottomSheetScrollView className="w-full px-5" contentContainerClassName="pb-10">
        <View className="py-2">
          <Text className="text-lg text-text-primary mb-2">{t('importMethods.seed.title')}</Text>
          <Text className="text-sm text-text-secondary mb-6">
            {t('importMethods.seed.subtitle')}
          </Text>

          <FormProvider {...form}>
            <View className="gap-2.5">
              <FormInput
                name="mnemonic"
                label={t('importMethods.seed.title')}
                placeholder={t('importMethods.seed.placeholder')}
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

          <View className="mt-6 rounded-xl bg-background-secondary p-4">
            <Text className="mb-2 text-sm font-semibold text-text-primary">
              {t('importMethods.seed.title')}
            </Text>
            <Text className="text-sm leading-5 text-text-secondary">
              {t('importMethods.seed.description')}
            </Text>
          </View>
        </View>
      </BottomSheetScrollView>
    </BaseScreen>
  );
};

export default ImportSeedPhraseScreen;
