import React from 'react';
import { View } from 'react-native';

export const ProgressIndicator: React.FC = () => (
  <View className="mb-14 w-[240px]">
    <View className="h-[3px] flex-row gap-1 rounded-full">
      <View className="h-[3px] flex-1 rounded-full bg-brand-primary" />
      <View className="h-[3px] flex-1 rounded-full bg-brand-primary" />
      <View className="h-[3px] flex-1 rounded-full bg-background-tertiary" />
      <View className="h-[3px] flex-1 rounded-full bg-background-tertiary" />
    </View>
  </View>
);
