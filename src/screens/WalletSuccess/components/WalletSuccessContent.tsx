import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components';
import type { WalletSuccessStrings } from '../hooks/useWalletSuccessScreen';

interface WalletSuccessContentProps {
  strings: WalletSuccessStrings;
  onGetStarted: () => void;
}

export const WalletSuccessContent: React.FC<WalletSuccessContentProps> = ({
  strings,
  onGetStarted,
}) => (
  <SafeAreaView className="flex-1 bg-primary">
    <View className="flex-1 items-center justify-center gap-8 px-5">
      <View className="items-center justify-center">
        <View className="h-[120px] w-[120px] items-center justify-center rounded-full bg-background-secondary">
          <Text className="text-[48px] font-semibold text-brand-primary">✓</Text>
        </View>
      </View>

      <View className="items-center gap-4">
        <Text className="text-center text-h4 text-text-primary">{strings.title}</Text>
        <Text className="text-center text-button text-text-secondary">{strings.subtitle}</Text>
      </View>
    </View>

    <Button
      type="primary"
      title={strings.cta}
      onPress={onGetStarted}
      className="absolute bottom-10 left-5 right-5"
    />
  </SafeAreaView>
);
