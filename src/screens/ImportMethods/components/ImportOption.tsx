import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { Colors } from '@/constants/colors';

interface ImportOptionProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

export const ImportOption: React.FC<ImportOptionProps> = ({ icon, title, subtitle, onPress }) => (
  <TouchableOpacity
    className="mb-4 flex-row items-center rounded-xl bg-background-secondary p-4 border border-border-secondary"
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View className="h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10">
      <Icon name={icon} size={24} color={Colors.brand.primary} />
    </View>
    <View className="ml-4 flex-1">
      <Text className="text-[16px] font-semibold text-text-primary">{title}</Text>
      <Text className="mt-1 text-[14px] text-text-secondary">{subtitle}</Text>
    </View>
    <Icon name="ArrowRight" size={20} color={Colors.brand.primary} />
  </TouchableOpacity>
);
