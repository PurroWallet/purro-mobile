import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '@/components/Button';
import { walletService } from '@/core/services';
import type { AccountStackParamList } from '../AccountStackNavigator';
import BaseScreen from '../components/BaseScreen';

interface HDKeyringInfo {
  id: string;
  accountCount: number;
  accounts: Array<{ address: string; index: number }>;
}

type Props = {
  mode?: 'create' | 'backup';
  onSeedPhraseSelected?: (keyringInfo: HDKeyringInfo) => void;
};

const SelectSeedPhraseScreen: React.FC<Props> = ({ mode = 'backup', onSeedPhraseSelected }) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AccountStackParamList, 'SelectSeedPhrase'>>();
  const [hdKeyrings, setHdKeyrings] = useState<HDKeyringInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKeyring, setSelectedKeyring] = useState<HDKeyringInfo | null>(null);

  useEffect(() => {
    loadHDKeyrings();
  }, []);

  const loadHDKeyrings = async () => {
    try {
      const keyrings = await walletService.getHDKeyringsWithAccounts();
      setHdKeyrings(keyrings);

      if (keyrings.length > 0) {
        setSelectedKeyring(keyrings[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load seed phrases. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectKeyring = (keyring: HDKeyringInfo) => {
    setSelectedKeyring(keyring);
  };

  const handleNext = async () => {
    if (!selectedKeyring) {
      Alert.alert('Required', 'Please select a seed phrase');
      return;
    }

    if (mode === 'backup') {
      // Extract keyring index from ID (e.g., "seed_1" -> 0)
      const keyringIndex = parseInt(selectedKeyring.id.split('_')[1]) - 1;

      // Navigate to seed phrase backup with selected keyring index
      navigation.navigate('SeedPhraseBackup', {
        selectedKeyringIndex: keyringIndex,
      });
    } else if (mode === 'create' && onSeedPhraseSelected) {
      // Pass the selected keyring to the callback
      // Navigation is handled by the callback to prevent race conditions
      onSeedPhraseSelected(selectedKeyring);
    }
  };

  return (
    <BaseScreen title={mode === 'backup' ? 'Backup Seed Phrase' : 'Select Seed Phrase'}>
      <View className="flex-1 gap-6">
        <View className="items-center gap-4">
          <Text className="w-[335px] text-center text-h4 text-text-primary">
            {mode === 'backup' ? 'Select Seed Phrase to Backup' : 'Select Seed Phrase'}
          </Text>
          <Text className="w-[335px] text-center text-button text-text-secondary">
            {mode === 'backup'
              ? 'Choose which seed phrase you want to back up'
              : 'Select which seed phrase to add a new account to'}
          </Text>
        </View>

        {loading ? (
          <Text className="text-center text-text-secondary">Loading seed phrases...</Text>
        ) : hdKeyrings.length === 0 ? (
          <View className="items-center gap-4">
            <Text className="text-center text-text-secondary">No seed phrases found</Text>
            <Text className="text-center text-sm text-text-tertiary">
              Create your first seed phrase by adding a new account
            </Text>
          </View>
        ) : (
          <ScrollView className="flex-1">
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
        )}

        <Button
          type="primary"
          title={mode === 'backup' ? 'View Seed Phrase' : 'Select Seed Phrase'}
          onPress={handleNext}
          disabled={!selectedKeyring}
        />
      </View>
    </BaseScreen>
  );
};

export default SelectSeedPhraseScreen;
