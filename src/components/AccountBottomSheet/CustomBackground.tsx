import { BottomSheetBackgroundProps } from '@gorhom/bottom-sheet';
import React, { useEffect, useMemo } from 'react';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useThemeMode } from '@/core/hooks/useTheme';

const CustomBackground: React.FC<BottomSheetBackgroundProps> = ({ style }) => {
  const { themeMode } = useThemeMode();
  const isDarkMode = themeMode === 'dark';
  const backgroundColor = useSharedValue(isDarkMode ? '#161616' : '#F9FAFB');

  useEffect(() => {
    backgroundColor.value = isDarkMode ? '#161616' : '#F9FAFB';
  }, [backgroundColor, isDarkMode]);

  const containerAnimatedStyle = useAnimatedStyle(
    () => ({
      backgroundColor: backgroundColor.value,
    }),
    [backgroundColor],
  );

  const containerStyle = useMemo(
    () => [style, containerAnimatedStyle],
    [style, containerAnimatedStyle],
  );

  return <Animated.View pointerEvents="none" style={containerStyle} />;
};

export default CustomBackground;
