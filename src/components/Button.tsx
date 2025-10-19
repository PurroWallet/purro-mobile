import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface ButtonProps {
  type?: 'primary' | 'secondary';
  title: string;
  onPress: () => void;
  disabled?: boolean;
  className?: string;
  textClassName?: string;
}

export function Button({
  type = 'primary',
  title,
  onPress,
  disabled = false,
  className,
  textClassName,
}: ButtonProps) {
  return (
    <TouchableOpacity
      className={`items-center justify-center rounded-xl px-4 py-3 ${
        type === 'primary' ? 'bg-brand-primary' : 'bg-button-secondary'
      } ${disabled ? 'opacity-50' : ''} ${className ?? ''}`}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text
        className={`text-base font-semibold ${
          type === 'primary' ? 'text-button-primary-text' : 'text-button-secondary-text'
        } ${disabled ? 'text-text-disabled' : ''} ${textClassName ?? ''}`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
