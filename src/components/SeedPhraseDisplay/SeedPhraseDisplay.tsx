import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button } from '@/components';
import { SeedWordCard } from './SeedWordCard';
import type { SeedPhraseDisplayStrings, SeedWordData } from './types';

interface SeedPhraseDisplayProps {
  strings: SeedPhraseDisplayStrings;
  words: SeedWordData[];
  isConfirmed: boolean;
  onToggleConfirmation: () => void;
  onContinue: () => void;
  showProgress?: boolean;
  customStyle?: string;
}

export const SeedPhraseDisplay: React.FC<SeedPhraseDisplayProps> = ({
  strings,
  words,
  isConfirmed,
  onToggleConfirmation,
  onContinue,
  showProgress = false,
  customStyle = '',
}) => {
  return (
    <View className={`flex-1 ${customStyle}`}>
      <View className="flex-1 items-center px-5 pt-5">
        {showProgress && (
          <View className="mb-8">
            <View className="h-1 w-16 rounded-full bg-brand-primary" />
            <View className="mt-2 h-1 w-16 rounded-full bg-border" />
          </View>
        )}

        <Text className="mb-8 w-[335px] text-center text-h4 text-text-primary">
          {strings.title}
        </Text>

        <View className="w-full max-w-[362px] flex-row flex-wrap justify-center gap-[10px] mb-8">
          {words.map((word) => (
            <SeedWordCard key={word.index} word={word.word} index={word.index} />
          ))}
        </View>
      </View>

      <View className="gap-4 px-5 pb-5">
        <Pressable
          className="flex-row items-center justify-center gap-2 py-3"
          onPress={onToggleConfirmation}
        >
          <View
            className={`h-4 w-4 items-center justify-center rounded border border-text-secondary ${
              isConfirmed ? 'border-brand-primary bg-brand-primary' : 'bg-transparent'
            }`}
          >
            {isConfirmed && (
              <View className="absolute left-[5px] top-[2px] h-[7px] w-[3px] rotate-45 border-b-2 border-r-2 border-system-white" />
            )}
          </View>
          <Text className="text-label text-text-primary">{strings.confirmation}</Text>
        </Pressable>

        <View className="px-5">
          <Text className="text-label leading-[19.6px] text-text-primary text-center">
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
    </View>
  );
};
