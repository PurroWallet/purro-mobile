import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@/components/Icon';
import { Colors } from '@/constants/colors';
import type { ImportMethodOption, ImportMethodsStrings } from '../hooks/useImportMethodsScreen';
import { ImportOption } from './ImportOption';

interface ImportMethodsContentProps {
  strings: ImportMethodsStrings;
  options: ImportMethodOption[];
  onBackPress: () => void;
}

export const ImportMethodsContent: React.FC<ImportMethodsContentProps> = ({
  strings,
  options,
  onBackPress,
}) => (
  <SafeAreaView className="flex-1 bg-primary">
    <View className="flex-row items-center justify-between border-b border-border-secondary px-5 py-4">
      <TouchableOpacity
        className="h-10 w-10 items-center justify-center"
        onPress={onBackPress}
        activeOpacity={0.8}
      >
        <Icon name="ArrowLeft" size={24} color={Colors.brand.primary} />
      </TouchableOpacity>
      <Text className="text-[20px] font-semibold text-text-primary">{strings.headerTitle}</Text>
      <View className="h-10 w-10" />
    </View>

    <ScrollView className="flex-1 px-5 pt-8">
      <Text className="mb-8 text-center text-h4 text-text-primary">{strings.subtitle}</Text>

      {options.map((option) => (
        <ImportOption
          key={option.icon}
          icon={option.icon}
          title={option.title}
          subtitle={option.subtitle}
          onPress={option.onPress}
        />
      ))}

      <View className="mt-8 rounded-xl bg-[rgba(235, 171, 22, 0.1)] p-4 border border-[rgba(235, 171, 22, 0.2)]">
        <View className="flex-row items-center mb-2">
          <Icon name="Warning" size={16} color={Colors.system.warning} />
          <Text className="ml-2 text-[14px] font-semibold text-[#EBAB16]">
            {strings.warningTitle}
          </Text>
        </View>
        <Text className="text-[14px] leading-[20px] text-text-secondary">
          {strings.warningDescription}
        </Text>
      </View>
    </ScrollView>
  </SafeAreaView>
);
