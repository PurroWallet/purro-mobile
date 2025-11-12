import React from 'react';
import { Text, View } from 'react-native';

interface SeedWordCardProps {
  index: number;
  word: string;
}

export const SeedWordCard: React.FC<SeedWordCardProps> = ({ index, word }) => (
  <View className="min-h-12 w-[176px] flex-row items-center gap-[14px] rounded-[10px] bg-overlay-card px-4 py-3">
    <Text className="w-6 text-left text-body text-text-secondary">{index}</Text>
    <Text className="flex-1 text-body text-text-primary">{word}</Text>
  </View>
);
