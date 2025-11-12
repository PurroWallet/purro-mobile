import React, { useEffect, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { FormProvider } from 'react-hook-form';
import { Alert, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, PasswordInputForm } from '@/components';
import { walletService } from '@/core/services';
import type {
  SeedPhraseBackupFormValues,
  SeedPhraseBackupStrings,
} from '../hooks/useSeedPhraseBackupScreen';

interface HDKeyringInfo {
  id: string;
  accountCount: number;
  accounts: Array<{ address: string; index: number }>;
}

interface SeedPhraseBackupContentProps {
  form: UseFormReturn<SeedPhraseBackupFormValues>;
  strings: SeedPhraseBackupStrings;
  isUnlocking: boolean;
  isSubmitDisabled: boolean;
  onSubmit: () => void;
}

export const SeedPhraseBackupContent: React.FC<SeedPhraseBackupContentProps> = ({
  form,
  strings,
  isUnlocking,
  isSubmitDisabled,
  onSubmit,
}) => {
  const [hdKeyrings, setHdKeyrings] = useState<HDKeyringInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKeyring, setSelectedKeyring] = useState<HDKeyringInfo | null>(null);

  useEffect(() => {
    loadHDKeyrings();
  }, []);

  const loadHDKeyrings = async () => {
    console.log('📱 SeedPhraseBackup: Loading HD keyrings...');
    try {
      const keyrings = await walletService.getHDKeyringsWithAccounts();
      console.log('✅ HD keyrings loaded:', keyrings.length);
      setHdKeyrings(keyrings);

      // Auto-select first keyring if available
      if (keyrings.length > 0) {
        setSelectedKeyring(keyrings[0]);
      }
    } catch (error) {
      console.error('❌ Error loading HD keyrings:', error);
      Alert.alert('Error', 'Failed to load seed phrases. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectKeyring = (keyring: HDKeyringInfo) => {
    console.log('👆 Selected keyring:', keyring.id);
    setSelectedKeyring(keyring);
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <StatusBar barStyle="light-content" backgroundColor="#161616" />

      <View className="flex-1 items-center justify-between px-5 py-5">
        <View className="w-full gap-6 pt-16">
          <View className="items-center gap-4">
            <Text className="w-[335px] text-center text-h4 text-text-primary">{strings.title}</Text>
            <Text className="w-[335px] text-center text-button text-text-secondary">
              {strings.subtitle}
            </Text>
          </View>

          {/* Seed Phrase Selection */}
          {loading ? (
            <Text className="text-center text-text-secondary">Loading seed phrases...</Text>
          ) : hdKeyrings.length === 0 ? (
            <View className="items-center gap-4">
              <Text className="text-center text-text-secondary">No seed phrases found</Text>
              <Text className="text-center text-sm text-text-tertiary">
                Create a new account to generate your first seed phrase
              </Text>
            </View>
          ) : (
            <View className="w-full gap-3">
              <Text className="text-sm text-text-secondary">Select seed phrase to backup:</Text>
              <ScrollView className="max-h-48">
                <View className="gap-3">
                  {hdKeyrings.map((keyring, index) => (
                    <TouchableOpacity
                      key={keyring.id}
                      className={`p-4 rounded-lg border ${
                        selectedKeyring?.id === keyring.id
                          ? 'border-brand-primary bg-[rgba(0,122,255,0.1)]'
                          : 'border-border bg-background-secondary'
                      }`}
                      onPress={() => handleSelectKeyring(keyring)}
                    >
                      <Text className="font-medium text-text-primary">Seed Phrase {index + 1}</Text>
                      <Text className="text-sm text-text-secondary mt-1">
                        {keyring.accountCount} account{keyring.accountCount !== 1 ? 's' : ''}
                      </Text>
                      <Text className="text-xs text-text-tertiary mt-1">
                        {keyring.accounts[0]?.address.slice(0, 10)}...
                        {keyring.accounts[0]?.address.slice(-8)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {selectedKeyring && (
            <View className="rounded-xl bg-[rgba(255,107,107,0.1)] p-4">
              <Text className="mb-2 text-[14px] font-semibold text-[#FF6B6B]">
                {strings.warningTitle}
              </Text>
              <Text className="text-[14px] leading-[20px] text-text-secondary">
                {strings.warningDescription}
              </Text>
            </View>
          )}

          <FormProvider {...form}>
            <View className="w-full gap-4">
              <PasswordInputForm
                name="password"
                label={strings.formLabel}
                placeholder={strings.formPlaceholder}
                secureTextEntry
                autoCapitalize="none"
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={onSubmit}
              />
            </View>
          </FormProvider>
        </View>

        <View className="w-full gap-4">
          <Button
            type="primary"
            title={isUnlocking ? strings.buttonLoading : strings.buttonSubmit}
            onPress={onSubmit}
            disabled={isSubmitDisabled || !selectedKeyring}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};
