import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { Alert, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';
import { Button, PasswordInputForm } from '@/components';
import { apisWallet } from '@/core/apis';
import { useZodForm, ZodFormValues } from '@/core/hooks/form/useZodForm';
import type { NavigationProp } from '@/types/navigation';
import { useTranslation } from '@/utils/i18n';

const unlockSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

type UnlockFormValues = ZodFormValues<typeof unlockSchema>;

const SeedPhraseBackupScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<'SeedPhraseBackup'>>();
  const { t } = useTranslation();
  const [isUnlocking, setIsUnlocking] = useState(false);

  const form = useZodForm(unlockSchema, {
    defaultValues: {
      password: '',
    },
    mode: 'onChange',
  });

  const isValid = form.formState.isValid;

  const handleUnlock = async (values: UnlockFormValues) => {
    if (isUnlocking) return;

    setIsUnlocking(true);

    try {
      // Try to unlock wallet with password
      await apisWallet.unlockWallet(values.password);

      // Get mnemonic for backup
      const mnemonic = await apisWallet.exportMnemonic();

      // Navigate to seed phrase display
      navigation.navigate('SeedPhraseDisplay', { mnemonic });
    } catch (error) {
      console.error('Error unlocking wallet:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to unlock wallet. Please try again.',
      );
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleSubmit = () => {
    form.handleSubmit(handleUnlock)();
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <StatusBar barStyle="light-content" backgroundColor="#161616" />

      <View className="flex-1 items-center justify-between px-5 py-5">
        <View className="w-full gap-8 pt-16">
          <View className="items-center gap-4">
            <Text className="w-[335px] text-center text-h4 text-text-primary">
              {t('seedPhrase.backup.title')}
            </Text>
            <Text className="w-[335px] text-center text-button text-text-secondary">
              {t('seedPhrase.backup.subtitle')}
            </Text>
          </View>

          <FormProvider {...form}>
            <View className="w-full gap-4">
              <PasswordInputForm
                name="password"
                label={t('seedPhrase.backup.form.label')}
                placeholder={t('seedPhrase.backup.form.placeholder')}
                secureTextEntry
                autoCapitalize="none"
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>
          </FormProvider>

          <View className="rounded-xl bg-[rgba(255,107,107,0.1)] p-4">
            <Text className="mb-2 text-[14px] font-semibold text-[#FF6B6B]">
              {t('seedPhrase.backup.warning.title')}
            </Text>
            <Text className="text-[14px] leading-[20px] text-text-secondary">
              {t('seedPhrase.backup.warning.description')}
            </Text>
          </View>
        </View>

        <View className="w-full gap-4">
          <Button
            type="primary"
            title={
              isUnlocking
                ? t('seedPhrase.backup.actions.loading')
                : t('seedPhrase.backup.actions.submit')
            }
            onPress={handleSubmit}
            disabled={!isValid || isUnlocking}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SeedPhraseBackupScreen;
