import { useColorScheme } from 'nativewind';
import React from 'react';
import { Switch, View } from 'react-native';

interface ThemeToggleProps {
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ value, onValueChange, disabled = false }) => {
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // Nếu không có value được truyền, sử dụng từ theme system
  const toggleValue = value !== undefined ? value : isDarkMode;

  const handleToggle = () => {
    if (onValueChange) {
      onValueChange(!toggleValue);
    } else {
      // Toggle theme system
      const nextMode = isDarkMode ? 'light' : 'dark';
      setColorScheme(nextMode);
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
