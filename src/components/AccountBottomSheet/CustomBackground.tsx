import { BottomSheetBackgroundProps } from '@gorhom/bottom-sheet';
import React, { useMemo } from 'react';
import Animated from 'react-native-reanimated';
import { useThemeMode } from '@/core/hooks/useTheme';

const CustomBackground: React.FC<BottomSheetBackgroundProps> = ({ style }) => {
  const { themeMode } = useThemeMode();

  const containerStyle = useMemo(() => {
    const background = {
      backgroundColor: themeMode === 'dark' ? '#161616' : '#F9FAFB',
    };

    if (Array.isArray(style)) {
      return [...style, background];
    }

    if (style) {
      return [style, background];
    }

    return [background];
  }, [style, themeMode]);

  return <Animated.View pointerEvents="none" style={containerStyle} />;
};

export default CustomBackground;
