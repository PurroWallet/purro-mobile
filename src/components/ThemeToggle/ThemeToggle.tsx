import React from 'react';
import { Switch, View } from 'react-native';
import { useThemeMode } from '@/core/hooks/useTheme';

interface ThemeToggleProps {
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ value, onValueChange, disabled = false }) => {
  const { themeMode, toggleThemeMode } = useThemeMode();
  const isDarkMode = themeMode === 'dark';

  // Nếu không có value được truyền, sử dụng từ theme system
  const toggleValue = value !== undefined ? value : isDarkMode;

  const handleToggle = () => {
    if (onValueChange) {
      onValueChange(!toggleValue);
    } else {
      // Toggle theme system
      console.log('🎨 ThemeToggle - Toggling theme from:', themeMode);
      toggleThemeMode();
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

export default ThemeToggle;
