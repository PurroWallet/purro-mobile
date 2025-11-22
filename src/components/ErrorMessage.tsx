import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Icon } from './Icon';

interface ErrorMessageProps {
  /** Error message to display */
  message?: string;
  /** Optional title for the error */
  title?: string;
  /** Retry callback */
  onRetry?: () => void;
  /** Retry button text */
  retryText?: string;
  /** Whether to show the error icon */
  showIcon?: boolean;
  /** Additional className for container */
  className?: string;
  /** Variant of error message */
  variant?: 'default' | 'inline' | 'banner';
}

/**
 * ErrorMessage Component
 * Standardized error message display with optional retry button
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message = 'Something went wrong',
  title,
  onRetry,
  retryText = 'Retry',
  showIcon = true,
  className = '',
  variant = 'default',
}) => {
  // Inline variant - compact error display
  if (variant === 'inline') {
    return (
      <View className={`flex-row items-center gap-2 ${className}`}>
        {showIcon && <Icon name="alert-circle" size={16} color="#EF4444" />}
        <Text className="text-system-error text-sm flex-1">{message}</Text>
        {onRetry && (
          <TouchableOpacity onPress={onRetry} activeOpacity={0.7}>
            <Text className="text-brand-primary text-sm font-medium">{retryText}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Banner variant - full-width banner
  if (variant === 'banner') {
    return (
      <View
        className={`px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/50 rounded-lg ${className}`}
      >
        <View className="flex-row items-start gap-3">
          {showIcon && <Icon name="alert-circle" size={16} color="#EF4444" />}
          <View className="flex-1">
            {title && <Text className="text-system-error text-sm font-semibold mb-1">{title}</Text>}
            <Text className="text-system-error text-sm">{message}</Text>
          </View>
          {onRetry && (
            <TouchableOpacity
              onPress={onRetry}
              className="px-3 py-1 bg-system-error rounded-md"
              activeOpacity={0.7}
            >
              <Text className="text-white text-xs font-medium">{retryText}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Default variant - centered error display
  return (
    <View className={`items-center justify-center py-20 px-4 ${className}`}>
      {showIcon && (
        <View className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 items-center justify-center mb-4">
          <Icon name="alert-circle" size={32} color="#EF4444" />
        </View>
      )}
      {title && (
        <Text className="text-text-primary text-lg font-semibold mb-2 text-center">{title}</Text>
      )}
      <Text className="text-system-error text-base mb-4 text-center">{message}</Text>
      {onRetry && (
        <TouchableOpacity
          className="bg-brand-primary px-6 py-3 rounded-lg"
          onPress={onRetry}
          activeOpacity={0.7}
        >
          <Text className="text-white font-medium">{retryText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

interface EmptyStateProps {
  /** Empty state message */
  message?: string;
  /** Optional title */
  title?: string;
  /** Icon name to display */
  iconName?: string;
  /** Action button text */
  actionText?: string;
  /** Action callback */
  onAction?: () => void;
  /** Additional className */
  className?: string;
}

/**
 * EmptyState Component
 * Standardized empty state display
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'No data available',
  title,
  iconName = 'inbox',
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <View className={`items-center justify-center py-20 px-4 ${className}`}>
      <View className="w-16 h-16 rounded-full bg-background-secondary items-center justify-center mb-4">
        <Icon name={iconName} size={32} color="#9CA3AF" />
      </View>
      {title && (
        <Text className="text-text-primary text-lg font-semibold mb-2 text-center">{title}</Text>
      )}
      <Text className="text-text-secondary text-base text-center mb-4">{message}</Text>
      {actionText && onAction && (
        <TouchableOpacity
          className="bg-brand-primary px-6 py-3 rounded-lg"
          onPress={onAction}
          activeOpacity={0.7}
        >
          <Text className="text-white font-medium">{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
