import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { useThemeMode } from '@/core/hooks/useTheme';

interface SheetHeaderProps {
  title: string;
  onBack?: () => void;
  showBackButton?: boolean;
  textColor?: string;
  iconColor?: string;
}

const SheetHeader: React.FC<SheetHeaderProps> = ({
  title,
  onBack,
  showBackButton = true,
  textColor,
  iconColor,
}) => {
  const { themeMode } = useThemeMode();
  const isDarkMode = themeMode === 'dark';

  // Use theme colors with proper fallbacks for visibility
  const defaultTextColor = textColor || (isDarkMode ? '#FFFFFF' : '#161616');
  const defaultIconColor = iconColor || (isDarkMode ? '#FFFFFF' : '#161616');

  return (
    <View className="flex-row items-center justify-center px-6 py-6">
      {showBackButton && onBack && (
        <TouchableOpacity
          onPress={onBack}
          className="absolute left-6 z-10 h-6 w-6 items-center justify-center"
        >
          <Icon name="ChevronLeft" size={24} color={defaultIconColor} />
        </TouchableOpacity>
      )}
      <Text className="text-center text-xl font-medium" style={{ color: defaultTextColor }}>
        {title}
      </Text>
    </View>
  );
};

SheetHeader.displayName = 'SheetHeader';

export default SheetHeader;
