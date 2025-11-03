import { useColorScheme } from 'nativewind';
import React, { PropsWithChildren, useEffect } from 'react';
import { View } from 'react-native';

/**
 * ThemeWrapper component that ensures NativeWind theme classes are applied
 * This component subscribes to nativewind's color scheme and re-renders when it changes
 */
export const ThemeWrapper: React.FC<PropsWithChildren> = ({ children }) => {
  const { colorScheme } = useColorScheme();

  useEffect(() => {
    console.log('🎨 ThemeWrapper - Current colorScheme:', colorScheme);
    console.log('🎨 ThemeWrapper - Dark mode active:', colorScheme === 'dark');
  }, [colorScheme]);

  const containerClassName =
    colorScheme === 'dark' ? 'flex-1 dark bg-primary' : 'flex-1 bg-primary';

  return <View className={containerClassName}>{children}</View>;
};
