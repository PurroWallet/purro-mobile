import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import Clipboard from '@react-native-clipboard/clipboard';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AccountStackParamList } from '../AccountStackNavigator';
import SheetHeader from '../components/SheetHeader';
import { walletController } from '@/core/controllers/WalletController';

type Props = NativeStackScreenProps<AccountStackParamList, 'SeedPhraseBackup'> & {
  onClose: () => void;
};

const SeedPhraseBackupScreen: React.FC<Props> = ({ navigation, onClose }) => {
  const [seedPhrase, setSeedPhrase] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);

  useEffect(() => {
    const loadSeedPhrase = async () => {
      try {
        setIsLoading(true);
        // Get the primary account (first account)
        const accounts = await walletController.getAllAccounts();
        if (accounts.length === 0) {
          Alert.alert('Error', 'No accounts found');
          onClose();
          return;
        }

        // Get the mnemonic from the first account (primary account)
        const primaryAccount = accounts[0];
        const mnemonic = await walletController.exportMnemonic();
        setSeedPhrase(mnemonic || '');
      } catch (error) {
        console.error('Error loading seed phrase:', error);
        Alert.alert('Error', 'Failed to load seed phrase');
        onClose();
      } finally {
        setIsLoading(false);
      }
    };

    loadSeedPhrase();
  }, [onClose]);

  const handleCopyToClipboard = () => {
    Clipboard.setString(seedPhrase);
    Alert.alert('Copied', 'Seed phrase copied to clipboard');
  };

  const handleReveal = () => {
    setIsRevealed(true);
  };

  if (isLoading) {
    return (
      <BottomSheetView className="flex-1 items-center justify-center">
        <Text className="text-lg text-[#F9F9F9]">Loading...</Text>
      </BottomSheetView>
    );
  }

  return (
    <BottomSheetView className="flex-1">
      {/* Header */}
      <SheetHeader 
        title="Backup Wallet"
        onBack={() => navigation.goBack()}
      />
      <View className="mb-4" />

      <ScrollView className="flex-1 px-5">
        <View className="py-2">
          <Text className="text-lg text-[#F9F9F9] mb-2">
            Your Recovery Phrase
          </Text>
          <Text className="text-sm text-[#8D94A3] mb-6">
            This phrase is the only way to recover your wallet. Keep it safe and never share it with anyone.
          </Text>

          <View className="mb-6 rounded-xl bg-[#373B43]/60 p-4">
            {!isRevealed ? (
              <TouchableOpacity
                onPress={handleReveal}
                className="items-center justify-center py-8"
              >
                <Text className="text-lg text-[#059288] font-medium">
                  Tap to reveal recovery phrase
                </Text>
              </TouchableOpacity>
            ) : (
              <View>
                <Text className="text-base text-[#F9F9F9] leading-6 mb-4">
                  {seedPhrase}
                </Text>
                <TouchableOpacity
                  onPress={handleCopyToClipboard}
                  className="self-center rounded-lg bg-[#059288] px-4 py-2"
                >
                  <Text className="text-sm text-[#F9F9F9] font-medium">
                    Copy to Clipboard
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View className="rounded-xl bg-[rgba(255,107,107,0.1)] p-4">
            <Text className="mb-2 text-sm font-semibold text-[#FF6B6B]">
              ⚠️ Important Security Notes
            </Text>
            <Text className="text-sm leading-5 text-[#8D94A3]">
              • Write down your recovery phrase on paper{'\n'}
              • Store it in a secure, private location{'\n'}
              • Never take a photo or store it digitally{'\n'}
              • Never share it with anyone{'\n'}
              • This phrase controls all accounts in your wallet
            </Text>
          </View>
        </View>
      </ScrollView>

      <View className="px-5 pb-6">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-full min-h-12 items-center justify-center rounded-xl bg-[#25272C]/60 px-6 py-4"
        >
          <Text className="text-base font-medium text-[#F9F9F9]">
            I've Secured My Recovery Phrase
          </Text>
        </TouchableOpacity>
      </View>
    </BottomSheetView>
  );
};

export default SeedPhraseBackupScreen;