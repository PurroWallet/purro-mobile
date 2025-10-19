import { ChevronLeft } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

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
  textColor = '#F9F9F9',
  iconColor = '#F9F9F9',
}) => {
  return (
    <View className="flex-row items-center justify-center px-6 py-6">
      {showBackButton && onBack && (
        <TouchableOpacity
          onPress={onBack}
          className="absolute left-6 z-10 h-6 w-6 items-center justify-center"
        >
          <ChevronLeft size={24} color={iconColor} />
        </TouchableOpacity>
      )}
      <Text className="text-center text-xl font-medium" style={{ color: textColor }}>
        {title}
      </Text>
    </View>
  );
};

export default SheetHeader;
