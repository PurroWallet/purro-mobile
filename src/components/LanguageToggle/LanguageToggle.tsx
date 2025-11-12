import React from 'react';
import { Switch, View } from 'react-native';
import i18n from '@/utils/i18n';

interface LanguageToggleProps {
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({
  value,
  onValueChange,
  disabled = false,
}) => {
  // true = Vietnamese, false = English
  const isVietnamese = i18n.language === 'vi';
  const toggleValue = value !== undefined ? value : isVietnamese;

  const handleToggle = async () => {
    const newValue = !toggleValue;
    const newLang = newValue ? 'vi' : 'en';

    if (onValueChange) {
      onValueChange(newValue);
    } else {
      try {
        await i18n.changeLanguage(newLang);
        console.log('🌐 Language changed to:', newLang);
      } catch (error) {
        console.error('Failed to change language:', error);
      }
    }
  };

  return (
    <View className="min-w-[51px] items-center justify-center pr-2">
      <Switch
        value={toggleValue}
        onValueChange={handleToggle}
        trackColor={{
          false: '#373B43',
          true: '#059288',
        }}
        thumbColor="#FFFFFF"
        disabled={disabled}
      />
    </View>
  );
};

export default LanguageToggle;
