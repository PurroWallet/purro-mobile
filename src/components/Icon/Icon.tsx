import { useColorScheme } from 'nativewind';
import React from 'react';
import type { ViewProps } from 'react-native';
import { View } from 'react-native';
import { useIcon } from './useIcon';

export interface IconProps extends Pick<ViewProps, 'className' | 'style'> {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color,
  strokeWidth = 2,
  className,
  style,
}) => {
  const resolution = useIcon(name);
  const { colorScheme } = useColorScheme();

  // Nếu không truyền color, dùng màu mặc định theo theme
  const defaultColor = colorScheme === 'dark' ? '#ffffff' : '#000000';
  const iconColor = color ?? defaultColor;

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
};
