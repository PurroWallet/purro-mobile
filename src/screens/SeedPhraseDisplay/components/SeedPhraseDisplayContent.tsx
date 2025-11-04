import React from 'react';
import { Pressable, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components';
import type { SeedPhraseDisplayStrings, SeedWordData } from '../hooks/useSeedPhraseDisplayScreen';
import { ProgressIndicator } from './ProgressIndicator';
import { SeedWordCard } from './SeedWordCard';

interface SeedPhraseDisplayContentProps {
  strings: SeedPhraseDisplayStrings;
  words: SeedWordData[];
  isConfirmed: boolean;
  onToggleConfirmation: () => void;
  onContinue: () => void;
}

export const SeedPhraseDisplayContent: React.FC<SeedPhraseDisplayContentProps> = ({
  strings,
  words,
  isConfirmed,
  onToggleConfirmation,
  onContinue,
}) => (
  <SafeAreaView className="flex-1 bg-primary">
    <StatusBar barStyle="light-content" backgroundColor="#161616" />

    <View className="flex-1 items-center px-5 pt-5">
      <ProgressIndicator />

      <Text className="mb-14 w-[335px] text-center text-h4 text-text-primary">{strings.title}</Text>

      <View className="w-full max-w-[362px] flex-row flex-wrap justify-center gap-[10px]">
        {words.map((word) => (
          <SeedWordCard key={word.index} word={word.word} index={word.index} />
        ))}
      </View>
    </View>

    <View className="gap-8 px-5 pb-5">
      <Pressable
        className="flex-row items-center justify-center gap-2 py-5"
        onPress={onToggleConfirmation}
      >
        <View
          className={`h-4 w-4 items-center justify-center rounded border border-text-secondary ${isConfirmed ? 'border-brand-primary bg-brand-primary' : 'bg-transparent'}`}
        >
          {isConfirmed && (
            <View className="absolute left-[5px] top-[2px] h-[7px] w-[3px] rotate-45 border-b-2 border-r-2 border-system-white" />
          )}
        </View>
        <Text className="text-label text-text-primary">{strings.confirmation}</Text>
      </Pressable>

      <View className="flex-row gap-2 px-5">
        <Text className="flex-1 text-label leading-[19.6px] text-text-primary">
          {strings.warning}
        </Text>
      </View>

      <Button
        type="primary"
        title={strings.continue}
        onPress={onContinue}
        disabled={!isConfirmed}
      />
    </View>
  </SafeAreaView>
);
