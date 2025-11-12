import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '@/components/Button';
import { walletService } from '@/core/services';
import type { AccountStackParamList } from '../AccountStackNavigator';
import BaseScreen from '../components/BaseScreen';

interface Account {
  address: string;
  aliasName?: string;
  brandName?: string;
}

type Props = {
  mode?: 'create' | 'backup';
  onAccountCreated?: (account: any) => void;
};

const SelectSeedPhraseScreen: React.FC<Props> = ({ mode = 'backup', onAccountCreated }) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AccountStackParamList, 'SelectSeedPhrase'>>();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const allAccounts = await walletService.getAllAccounts();
      setAccounts(allAccounts);
    } catch (error) {
      console.error('Error loading accounts:', error);
      Alert.alert('Error', 'Failed to load accounts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAccount = (account: Account) => {
    setSelectedAccount(account);
  };

  const handleNext = async () => {
    if (!selectedAccount) {
      Alert.alert('Required', 'Please select an account');
      return;
    }

    if (mode === 'backup') {
      navigation.navigate('SeedPhraseBackup');
    } else if (mode === 'create' && onAccountCreated) {
      // Handle create mode logic
      onAccountCreated(selectedAccount);
      navigation.goBack();
    }
  };

  return (
    <BaseScreen title={mode === 'backup' ? 'Backup Seed Phrase' : 'Select Account'}>
      <View className="flex-1 gap-6">
        <View className="items-center gap-4">
          <Text className="w-[335px] text-center text-h4 text-text-primary">
            {mode === 'backup' ? 'Select Account to Backup' : 'Select Account'}
          </Text>
          <Text className="w-[335px] text-center text-button text-text-secondary">
            {mode === 'backup'
              ? "Choose which account's seed phrase you want to back up"
              : 'Select an account to continue'}
          </Text>
        </View>

        {loading ? (
          <Text className="text-center text-text-secondary">Loading accounts...</Text>
        ) : (
          <ScrollView className="flex-1">
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

        <Button
          type="primary"
          title={mode === 'backup' ? 'Continue to Backup' : 'Select Account'}
          onPress={handleNext}
          disabled={!selectedAccount}
        />
      </View>
    </BaseScreen>
  );
};

export default SelectSeedPhraseScreen;
