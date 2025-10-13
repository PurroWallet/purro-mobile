import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface ButtonProps {
  type?: 'primary' | 'secondary';
  title: string;
  onPress: () => void;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  buttonStyle?: ViewStyle;
}

export function Button({
  type = 'primary',
  title,
  onPress,
  disabled = false,
  containerStyle,
  buttonStyle,
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        type === 'primary'
          ? styles.primaryContainer
          : styles.secondaryContainer,
        disabled && styles.disabled,
        containerStyle,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.text,
          type === 'primary' ? styles.primaryText : styles.secondaryText,
          disabled && styles.disabledText,
          buttonStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryContainer: {
    backgroundColor: '#007AFF',
  },
  secondaryContainer: {
    backgroundColor: '#F0F0F0',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#000000',
  },
  disabledText: {
    color: '#999999',
  },
});

