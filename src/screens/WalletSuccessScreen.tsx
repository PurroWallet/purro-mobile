import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components';
import type { WalletSuccessScreenProps } from '@/types/navigation';
import { useTranslation } from '@/utils/i18n';

/**
 * Wallet Success Screen
 * Shown after successful wallet creation
 * Following Figma design: node-id=260-1901
 */
const WalletSuccessScreen: React.FC<WalletSuccessScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const handleGetStarted = () => {
    // Navigate to Home screen
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      {/* Content */}
      <View className="flex-1 items-center justify-center gap-8 px-5">
        {/* Success Icon */}
        <View className="items-center justify-center">
          <View className="h-[120px] w-[120px] items-center justify-center rounded-full bg-background-secondary">
            <Text className="text-[48px] font-semibold text-brand-primary">✓</Text>
          </View>
        </View>

        {/* Success Message */}
        <View className="items-center gap-4">
          <Text className="text-center text-h4 text-text-primary">{t('walletSuccess.title')}</Text>
          <Text className="text-center text-button text-text-secondary">
            {t('walletSuccess.subtitle')}
          </Text>
        </View>
      </View>

      {/* Get Started Button */}
      <Button
        type="primary"
        title={t('walletSuccess.actions.cta')}
        onPress={handleGetStarted}
        className="absolute bottom-10 left-5 right-5"
      />
    </SafeAreaView>
  );
};

export default WalletSuccessScreen;
