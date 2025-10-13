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
  color = 'currentColor',
  strokeWidth = 2,
  className,
  style,
}) => {
  const resolution = useIcon(name);

  if (resolution.type === 'lucide') {
    const LucideComponent = resolution.Component;
    return (
      <View className={className} style={style}>
        <LucideComponent size={size} color={color} strokeWidth={strokeWidth} />
      </View>
    );
  }

  if (resolution.type === 'custom') {
    const CustomComponent = resolution.Component;
    return (
      <View className={className} style={style}>
        <CustomComponent size={size} color={color} />
      </View>
    );
  }

  return null;
};
