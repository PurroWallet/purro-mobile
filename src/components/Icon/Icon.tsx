import React, { memo } from 'react';
import type { ViewProps } from 'react-native';
import { View } from 'react-native';
import { useThemeMode } from '@/core/hooks/useTheme';
import { useIcon } from './useIcon';

export interface IconProps extends Pick<ViewProps, 'className' | 'style'> {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const Icon: React.FC<IconProps> = memo(
  ({ name, size = 24, color, strokeWidth = 2, className, style }) => {
    const resolution = useIcon(name);
    const { themeMode } = useThemeMode();

    // Only compute theme-based color if no color is provided
    const iconColor = color ?? (themeMode === 'dark' ? '#FFFFFF' : '#000000');

    if (resolution.type === 'lucide') {
      const LucideComponent = resolution.Component;
      return (
        <View className={className} style={style}>
          <LucideComponent size={size} strokeWidth={strokeWidth} color={iconColor} />
        </View>
      );
    }

    if (resolution.type === 'custom') {
      const CustomComponent = resolution.Component;
      return (
        <View className={className} style={style}>
          <CustomComponent size={size} color={iconColor} />
        </View>
      );
    }

    return null;
  },
);
