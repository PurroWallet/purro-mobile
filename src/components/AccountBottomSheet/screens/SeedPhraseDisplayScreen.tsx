import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { SeedWordCard } from '@/components/SeedPhraseDisplay';
import { useTranslation } from '@/utils/i18n';
import type { AccountStackParamList } from '../AccountStackNavigator';
import BaseScreen from '../components/BaseScreen';

type Props = {
  onClose: () => void;
};

const SeedPhraseDisplayScreen: React.FC<Props> = ({ onClose }) => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<AccountStackParamList, 'SeedPhraseDisplay'>>();
  const { mnemonic } = route.params;
  const { t } = useTranslation();

  const [isConfirmed, setIsConfirmed] = React.useState(false);

  const words = mnemonic.split(' ').map((word, index) => ({ word, index: index + 1 }));

  const onToggleConfirmation = () => {
    setIsConfirmed((prev) => !prev);
  };

  const onContinue = () => {
    if (!isConfirmed) {
      return;
    }
    navigation.navigate('SeedPhraseVerify', { mnemonic, isBottomSheet: true });
  };

  const handleBackPress = () => {
    onClose();
  };

  const renderFooter = () => (
    <View className="gap-4 px-5 pb-5">
      <TouchableOpacity
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
        <Text className="text-label text-text-primary">{t('seedPhrase.display.confirmation')}</Text>
      </TouchableOpacity>

      <Text className="px-5 text-label leading-[19.6px] text-text-primary text-center">
        {t('seedPhrase.display.warning')}
      </Text>

      <TouchableOpacity
        className={`rounded-lg px-6 py-4 ${
          isConfirmed ? 'bg-brand-primary' : 'bg-border opacity-50'
        }`}
        onPress={onContinue}
        disabled={!isConfirmed}
      >
        <Text
          className={`text-center font-medium ${isConfirmed ? 'text-white' : 'text-text-tertiary'}`}
        >
          {t('seedPhrase.display.actions.continue')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <BaseScreen
      title={t('seedPhrase.display.title')}
      showBackButton={true}
      onBack={handleBackPress}
      isScrollable={true}
      footer={renderFooter()}
    >
      {/* Progress Indicator */}
      <View className="items-center mb-8">
        <View className="h-1 w-16 rounded-full bg-brand-primary" />
        <View className="mt-2 h-1 w-16 rounded-full bg-border" />
      </View>

      {/* Seed Words */}
      <View className="items-center mb-8">
        <Text className="w-[335px] text-center text-button text-text-secondary mb-6">
          {t('seedPhrase.display.subtitle')}
        </Text>

        <View className="w-full max-w-[362px] flex-row flex-wrap justify-center gap-[10px]">
          {words.map((wordData) => (
            <SeedWordCard key={wordData.index} word={wordData.word} index={wordData.index} />
          ))}
        </View>
      </View>
    </BaseScreen>
  );
};

SeedPhraseDisplayScreen.displayName = 'SeedPhraseDisplayScreen';

export default SeedPhraseDisplayScreen;
