import { Filter } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from '@/utils/i18n';

interface HeaderProps {
  onFilterPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onFilterPress }) => {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-primary">
      <Text className="text-3xl font-bold text-text-primary">{t('home.nav.history')}</Text>
      <TouchableOpacity
        onPress={onFilterPress}
        className="w-10 h-10 items-center justify-center rounded-lg bg-background-secondary"
        activeOpacity={0.7}
      >
        <Filter size={20} color="#059288" />
      </TouchableOpacity>
    </View>
  );
};

export default Header;
