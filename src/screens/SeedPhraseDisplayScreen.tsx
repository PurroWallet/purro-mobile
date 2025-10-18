import { usePreventScreenshot } from '@/hooks/native/security';
import { SeedPhraseDisplayScreenProps } from '@/types/navigation';
import React, { useState } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProgressIndicator = () => (
  <View className="mb-14 w-[240px]">
    <View className="h-[3px] flex-row gap-1 rounded-full">
      <View className="h-[3px] flex-1 rounded-full bg-brand-primary" />
      <View className="h-[3px] flex-1 rounded-full bg-background-tertiary" />
      <View className="h-[3px] flex-1 rounded-full bg-background-tertiary" />
      <View className="h-[3px] flex-1 rounded-full bg-background-tertiary" />
    </View>
  </View>
);

const SeedWordCard = ({ word, index }: { word: string; index: number }) => (
  <View className="min-h-12 w-[176px] flex-row items-center gap-[14px] rounded-[10px] bg-overlay-card px-4 py-3">
    <Text className="w-6 text-left text-body text-text-secondary">{index}</Text>
    <Text className="flex-1 text-body text-text-primary">{word}</Text>
  </View>
);

const SeedPhraseDisplayScreen: React.FC<SeedPhraseDisplayScreenProps> = ({
  route,
  navigation,
}) => {
  const { mnemonic } = route.params;

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [words] = useState(() => mnemonic.split(' '));

  usePreventScreenshot(true);

  const handleContinue = () => {
    if (!isConfirmed) {
      return;
    }

    // Navigate to seed phrase verification
    navigation.navigate('SeedPhraseVerify', { mnemonic });
  };

  const toggleConfirmation = () => {
    setIsConfirmed(!isConfirmed);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <StatusBar barStyle="light-content" backgroundColor="#161616" />

      <View className="flex-1 items-center px-5 pt-5">
        <ProgressIndicator />

        <Text className="mb-14 w-[335px] text-center text-h4 text-text-primary">
          Your Seed Phrase
        </Text>

        <View className="w-full max-w-[362px] flex-row flex-wrap justify-center gap-[10px]">
          {words.map((word, index) => (
            <SeedWordCard key={index} word={word} index={index + 1} />
          ))}
        </View>
      </View>

      <View className="gap-8 px-5 pb-5">
        <Pressable
          className="flex-row items-center justify-center gap-2 py-5"
          onPress={toggleConfirmation}
        >
          <View
            className={`h-4 w-4 items-center justify-center rounded border border-text-secondary ${isConfirmed ? 'border-brand-primary bg-brand-primary' : 'bg-transparent'}`}
          >
            {isConfirmed && (
              <View className="absolute left-[5px] top-[2px] h-[7px] w-[3px] rotate-45 border-b-2 border-r-2 border-system-white" />
            )}
          </View>
          <Text className="text-label text-text-primary">
            I've saved my seed phrase
          </Text>
        </Pressable>

        <View className="flex-row gap-2 px-5">
          <Text className="flex-1 text-label leading-[19.6px] text-text-primary">
            Store your seed phrase in a safe & offline place, never share it
            with anyone. This is the only way to recover your wallet.
          </Text>
        </View>

        <TouchableOpacity
          className={`h-14 items-center justify-center rounded-xl px-6 py-4 ${isConfirmed ? 'bg-brand-primary' : 'bg-button-primary-disabled'}`}
          onPress={handleContinue}
          disabled={!isConfirmed}
        >
          <Text
            className={`text-button ${isConfirmed ? 'text-button-primary-text' : 'text-button-primary-disabled-text'}`}
          >
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SeedPhraseDisplayScreen;
