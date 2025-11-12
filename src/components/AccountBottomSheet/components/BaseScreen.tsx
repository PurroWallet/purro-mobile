import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DefaultIcon from '@/assets/common/icon.png';
import { Icon } from '@/components/Icon';
import { formatAddress } from '@/utils/address';
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
              <Text className="text-base font-semibold mb-1 text-text-primary">
                {currentAccountName}
              </Text>
              <Text className="text-xs text-text-secondary">
                {formatAddress(currentAccountAddress || '')}
              </Text>
            </View>
            {onSettings && (
              <TouchableOpacity
                onPress={onSettings}
                className="w-6 h-6 items-center justify-center"
              >
                <Icon name="Settings" size={24} />
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
    <View className="flex-1 bg-primary">
      {renderHeader()}
      {renderContent()}
      {footer && <View className="absolute bottom-0 left-0 right-0">{footer}</View>}
    </View>
  );
};

export default BaseScreen;
