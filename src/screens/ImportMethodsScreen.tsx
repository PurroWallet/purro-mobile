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
          Import Wallet
        </Text>
        <View className="h-10 w-10" />
      </View>

      <ScrollView className="flex-1 px-5 pt-8">
        <Text className="mb-8 text-center text-h4 text-text-primary">
          Choose how to import your wallet
        </Text>

        <ImportOption
          icon="ImportMnemonic"
          title="Import Seed Phrase"
          subtitle="Use your 12 or 24-word recovery phrase"
          onPress={handleImportSeedPhrase}
        />

        <ImportOption
          icon="ImportPrivateKey"
          title="Import Private Key"
          subtitle="Use your private key to import a single address"
          onPress={handleImportPrivateKey}
        />

        <View className="mt-8 rounded-xl bg-[rgba(235, 171, 22, 0.1)] p-4 border border-[rgba(235, 171, 22, 0.2)]">
          <View className="flex-row items-center mb-2">
            <Icon name="Warning" size={16} color={Colors.system.warning} />
            <Text className="ml-2 text-[14px] font-semibold text-[#EBAB16]">
              Security Note
            </Text>
          </View>
          <Text className="text-[14px] leading-[20px] text-text-secondary">
            Never share your seed phrase or private key with anyone. Store them in a secure location.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ImportMethodsScreen;