import { useColorScheme } from 'nativewind';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DefaultIcon from '@/assets/common/icon.png';
import { Icon } from '@/components/Icon';
import SheetHeader from './SheetHeader';

interface BaseScreenProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  showAccountInfo?: boolean;
  currentAccountName?: string;
  currentAccountAddress?: string;
  onSettings?: () => void;
  footer?: React.ReactNode;
  isScrollable?: boolean;
  contentContainerStyle?: any;
}

const BaseScreen: React.FC<BaseScreenProps> = ({
  children,
  title,
  showBackButton = false,
  onBack,
  showAccountInfo = false,
  currentAccountName,
  currentAccountAddress,
  onSettings,
  footer,
  isScrollable = false,
  contentContainerStyle,
}) => {
  const { top: topSafeArea } = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const renderHeader = () => {
    if (!title && !showAccountInfo) return null;

    return (
      <View>
        {/* Header Title - for other screens */}
        {title && <SheetHeader title={title} showBackButton={showBackButton} onBack={onBack} />}

        {/* Account Info - only for AccountList screen */}
        {showAccountInfo && currentAccountName && (
          <View className="flex-row items-center justify-center px-6 my-4 py-2">
            <Image source={DefaultIcon} className="w-9 h-9 rounded-full mr-3" resizeMode="cover" />
            <View className="flex-1">
              <Text
                className={`text-base font-semibold mb-1 ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-900'
                }`}
              >
                {currentAccountName}
              </Text>
              <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {formatAddress(currentAccountAddress || '')}
              </Text>
            </View>
            {onSettings && (
              <TouchableOpacity
                onPress={onSettings}
                className="w-6 h-6 items-center justify-center"
              >
                <Icon name="Settings" size={24} color={isDarkMode ? '#F9F9F9' : '#161616'} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderContent = () => {
    return (
      <View className={`flex-1`} style={contentContainerStyle}>
        {children}
      </View>
    );
  };

  return (
    <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {renderHeader()}
      {renderContent()}
      {footer && <View className="absolute bottom-0 left-0 right-0">{footer}</View>}
    </View>
  );
};

export default BaseScreen;
