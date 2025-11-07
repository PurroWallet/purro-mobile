import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components';
import { walletService } from '@/core/services';
import { SeedPhraseBackupScreenProps } from '@/types/navigation';
import { useTranslation } from '@/utils/i18n';

interface Account {
  address: string;
  aliasName?: string;
  brandName?: string;
}

const SeedPhraseBackupScreen: React.FC<SeedPhraseBackupScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [password, setPassword] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    console.log('📱 SeedPhraseBackup: Loading accounts...');
    try {
      const allAccounts = await walletService.getAllAccounts();
      console.log('✅ Accounts loaded:', allAccounts.length);
      setAccounts(allAccounts);
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

  const handleViewSeedPhrase = async () => {
    if (!selectedAccount || !password.trim()) {
      Alert.alert('Required', 'Please select an account and enter password');
      return;
    }

    console.log('🔐 Starting seed phrase backup process...');
    console.log(
      '📍 Selected account:',
      selectedAccount.aliasName || selectedAccount.address.substring(0, 10) + '...',
    );
    console.log('📍 Selected address:', selectedAccount.address);
    setIsUnlocking(true);

    try {
      console.log('📊 Step 1: Unlocking wallet...');
      const startTime = Date.now();
      const success = await walletService.unlockWallet(password);
      const unlockTime = Date.now() - startTime;
      console.log(`✅ Wallet unlocked in ${unlockTime}ms, success: ${success}`);

      if (!success) {
        Alert.alert('Error', 'Invalid password. Please try again.');
        return;
      }

      console.log('📝 Step 2: Getting mnemonic for selected account...');
      const mnemonicStartTime = Date.now();

      // FIXED: Use the new method to get mnemonic for the specific account address
      const mnemonic = await walletService.exportMnemonicForAddress(selectedAccount.address);

      const mnemonicTime = Date.now() - mnemonicStartTime;
      console.log(
        `✅ Mnemonic retrieved in ${mnemonicTime}ms:`,
        mnemonic?.substring(0, 20) + '...',
      );
      console.log(
        '🔑 Mnemonic matches selected account:',
        selectedAccount.address.substring(0, 10) + '...',
      );

      // Navigate to seed phrase display
      console.log('🎯 Navigating to SeedPhraseDisplay...');
      navigation.navigate('SeedPhraseDisplay', {
        mnemonic,
      });
    } catch (error) {
      console.error('❌ Error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to backup seed phrase');
    } finally {
      setIsUnlocking(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <StatusBar barStyle="light-content" backgroundColor="#161616" />

      <View className="flex-1 items-center justify-between px-5 py-5">
        <View className="w-full gap-6 pt-16">
          <View className="items-center gap-4">
            <Text className="w-[335px] text-center text-h4 text-text-primary">
              {t('seedPhrase.backup.title')}
            </Text>
            <Text className="w-[335px] text-center text-button text-text-secondary">
              {t('seedPhrase.backup.subtitle')}
            </Text>
          </View>

          {loading ? (
            <Text className="text-center text-text-secondary">Loading accounts...</Text>
          ) : (
            <ScrollView className="w-full max-h-48">
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
          )}

          {selectedAccount && (
            <View className="w-full gap-3">
              <View className="rounded-xl bg-[rgba(255,107,107,0.1)] p-4">
                <Text className="mb-2 text-[14px] font-semibold text-[#FF6B6B]">
                  {t('seedPhrase.backup.warning.title')}
                </Text>
                <Text className="text-[14px] leading-[20px] text-text-secondary">
                  {t('seedPhrase.backup.warning.description')}
                </Text>
              </View>

              <View className="w-full gap-2">
                <Text className="text-sm text-text-secondary">Enter password to confirm:</Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#444',
                    borderRadius: 8,
                    padding: 12,
                    color: '#fff',
                    backgroundColor: '#2a2a2a',
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor="#888"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  textContentType="password"
                />
              </View>
            </View>
          )}
        </View>

        <View className="w-full gap-4">
          <Button
            type="primary"
            title={isUnlocking ? 'Loading...' : 'View Seed Phrase'}
            onPress={handleViewSeedPhrase}
            disabled={!selectedAccount || !password.trim() || isUnlocking}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SeedPhraseBackupScreen;
