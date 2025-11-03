import { useColorScheme } from 'nativewind';
import React, { PropsWithChildren } from 'react';
import { View } from 'react-native';

/**
 * ThemeWrapper component that ensures NativeWind theme classes are applied
 * This component subscribes to nativewind's color scheme and re-renders when it changes
 */
export const ThemeWrapper: React.FC<PropsWithChildren> = ({ children }) => {
  const { colorScheme } = useColorScheme();

  console.log('🎨 ThemeWrapper - Current colorScheme:', colorScheme);

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: colorScheme === 'dark' ? '#161616' : '#F9FAFB' }}
    >
      {children}
    </View>
  );
};
