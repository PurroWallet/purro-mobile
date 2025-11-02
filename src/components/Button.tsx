import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface ButtonProps {
  type?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  title?: string;
  onPress: () => void;
  disabled?: boolean;
  className?: string;
  textClassName?: string;
}

export function Button({
  type = 'primary',
  size = 'lg',
  title,
  onPress,
  disabled = false,
  className,
  textClassName,
}: ButtonProps) {
  const sizeStyles = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-4 py-4',
  };

  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <TouchableOpacity
      className={`items-center justify-center rounded-xl ${sizeStyles[size]} ${
        type === 'primary' ? 'bg-brand-primary' : 'bg-button-secondary'
      } ${disabled ? 'opacity-50' : ''} ${className ?? ''}`}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text
        className={`${textSizeStyles[size]} font-semibold ${
          type === 'primary' ? 'text-button-primary-text' : 'text-button-secondary-text'
        } ${disabled ? 'text-text-disabled' : ''} ${textClassName ?? ''}`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
