import { BottomSheetBackgroundProps } from '@gorhom/bottom-sheet';
import React from 'react';
import Animated from 'react-native-reanimated';
import { useThemeMode } from '@/core/hooks/useTheme';

const CustomBackground: React.FC<BottomSheetBackgroundProps> = ({ style }) => {
  const { themeMode } = useThemeMode();

  console.log(themeMode);

  return (
    <Animated.View
      pointerEvents="none"
      className={themeMode === 'dark' ? 'bg-[#161616]' : 'bg-[#F9FAFB]'}
      style={style}
    />
  );
};

export default CustomBackground;
