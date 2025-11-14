import React from 'react';
import type { DimensionValue, ViewStyle } from 'react-native';
import { View } from 'react-native';

interface LoadingSkeletonProps {
  /** Width of the skeleton (can be number or percentage string) */
  width?: DimensionValue;
  /** Height of the skeleton */
  height?: number;
  /** Border radius */
  borderRadius?: number;
  /** Additional className for styling */
  className?: string;
  /** Custom style */
  style?: ViewStyle;
}

/**
 * LoadingSkeleton Component
 * Standardized loading skeleton for consistent loading states across the app
 */
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  className = '',
  style,
}) => {
  return (
    <View
      className={`bg-background-tertiary animate-pulse ${className}`}
      style={[
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
    />
  );
};

interface SkeletonListItemProps {
  /** Whether to show avatar/icon */
  showAvatar?: boolean;
  /** Number of text lines */
  lines?: number;
  /** Additional className */
  className?: string;
}

/**
 * SkeletonListItem Component
 * Pre-configured skeleton for list items
 */
export const SkeletonListItem: React.FC<SkeletonListItemProps> = ({
  showAvatar = true,
  lines = 2,
  className = '',
}) => {
  return (
    <View className={`flex-row items-center gap-4 ${className}`}>
      {showAvatar && <LoadingSkeleton width={48} height={48} borderRadius={24} />}
      <View className="flex-1 gap-2">
        {Array.from({ length: lines }).map((_, index) => (
          <LoadingSkeleton
            key={index}
            width={index === 0 ? '70%' : '50%'}
            height={index === 0 ? 20 : 16}
          />
        ))}
      </View>
      <LoadingSkeleton width={80} height={20} />
    </View>
  );
};

interface SkeletonCardProps {
  /** Card height */
  height?: number;
  /** Additional className */
  className?: string;
}

/**
 * SkeletonCard Component
 * Pre-configured skeleton for card items
 */
export const SkeletonCard: React.FC<SkeletonCardProps> = ({ height = 200, className = '' }) => {
  return (
    <View className={`rounded-xl bg-background-secondary overflow-hidden ${className}`}>
      <LoadingSkeleton width="100%" height={height} borderRadius={0} />
      <View className="p-3 gap-2">
        <LoadingSkeleton width="75%" height={20} />
        <LoadingSkeleton width="50%" height={16} />
      </View>
    </View>
  );
};
