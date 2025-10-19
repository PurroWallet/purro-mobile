import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { Colors } from '@/constants/colors';
import type { ImportMethodsScreenProps } from '@/types/navigation';
import { useTranslation } from '@/utils/i18n';

// ImportOption component moved outside the component to avoid recreation on each render
const ImportOption = ({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    className="mb-4 flex-row items-center rounded-xl bg-background-secondary p-4 border border-border-secondary"
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View className="h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10">
      <Icon name={icon} size={24} color={Colors.brand.primary} />
    </View>
    <View className="ml-4 flex-1">
      <Text className="text-[16px] font-semibold text-text-primary">
        {title}
      </Text>
      <Text className="mt-1 text-[14px] text-text-secondary">
        {subtitle}
      </Text>
    </View>
    <Icon name="ArrowRight" size={20} color={Colors.brand.primary} />
  </TouchableOpacity>
);

const ImportMethodsScreen: React.FC<ImportMethodsScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const handleImportSeedPhrase = () => {
    navigation.navigate('ImportSeedPhrase');
  };

  const handleImportPrivateKey = () => {
    navigation.navigate('ImportPrivateKey');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-border-secondary px-5 py-4">
        <TouchableOpacity
          className="h-10 w-10 items-center justify-center"
          onPress={handleBack}
          activeOpacity={0.8}
        >
          <Icon name="ArrowLeft" size={24} color={Colors.brand.primary} />
        </TouchableOpacity>
        <Text className="text-[20px] font-semibold text-text-primary">
          {t('importMethods.title')}
        </Text>
        <View className="h-10 w-10" />
      </View>

      <ScrollView className="flex-1 px-5 pt-8">
        <Text className="mb-8 text-center text-h4 text-text-primary">
          {t('importMethods.subtitle')}
        </Text>

        <ImportOption
          icon="ImportMnemonic"
          title={t('importMethods.seed.title')}
          subtitle={t('importMethods.seed.subtitle')}
          onPress={handleImportSeedPhrase}
        />

        <ImportOption
          icon="ImportPrivateKey"
          title={t('importMethods.privateKey.title')}
          subtitle={t('importMethods.privateKey.subtitle')}
          onPress={handleImportPrivateKey}
        />

        <View className="mt-8 rounded-xl bg-[rgba(235, 171, 22, 0.1)] p-4 border border-[rgba(235, 171, 22, 0.2)]">
          <View className="flex-row items-center mb-2">
            <Icon name="Warning" size={16} color={Colors.system.warning} />
            <Text className="ml-2 text-[14px] font-semibold text-[#EBAB16]">
              {t('importMethods.warning.title')}
            </Text>
          </View>
          <Text className="text-[14px] leading-[20px] text-text-secondary">
            {t('importMethods.warning.description')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ImportMethodsScreen;