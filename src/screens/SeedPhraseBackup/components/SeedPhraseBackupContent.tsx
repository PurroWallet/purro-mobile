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

interface Account {
  address: string;
  aliasName?: string;
  brandName?: string;
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
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    console.log('📱 SeedPhraseBackup: Loading accounts...');
    try {
      const allAccounts = await walletService.getAllAccounts();
      console.log('✅ Accounts loaded:', allAccounts.length);
      setAccounts(allAccounts);

      // Auto-select first account if available
      if (allAccounts.length > 0) {
        setSelectedAccount(allAccounts[0]);
      }
    } catch (error) {
      console.error('❌ Error loading accounts:', error);
      Alert.alert('Error', 'Failed to load accounts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAccount = (account: Account) => {
    console.log(
      '👆 Selected account:',
      account.aliasName || account.address.substring(0, 10) + '...',
    );
    setSelectedAccount(account);
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

          {/* Account Selection */}
          {loading ? (
            <Text className="text-center text-text-secondary">Loading accounts...</Text>
          ) : accounts.length > 0 ? (
            <View className="w-full gap-3">
              <Text className="text-sm text-text-secondary">Select account to backup:</Text>
              <ScrollView className="max-h-48">
                <View className="gap-3">
                  {accounts.map((account, index) => (
                    <TouchableOpacity
                      key={account.address}
                      className={`p-4 rounded-lg border ${
                        selectedAccount?.address === account.address
                          ? 'border-brand-primary bg-[rgba(0,122,255,0.1)]'
                          : 'border-border bg-background-secondary'
                      }`}
                      onPress={() => handleSelectAccount(account)}
                    >
                      <Text className="font-medium text-text-primary">
                        {account.aliasName || `Account ${index + 1}`}
                      </Text>
                      <Text className="text-sm text-text-secondary mt-1">
                        {account.address.slice(0, 10)}...{account.address.slice(-8)}
                      </Text>
                      <Text className="text-xs text-text-tertiary mt-1">{account.brandName}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          ) : (
            <Text className="text-center text-text-secondary">No accounts found</Text>
          )}

          {selectedAccount && (
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
            disabled={isSubmitDisabled || !selectedAccount}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};
