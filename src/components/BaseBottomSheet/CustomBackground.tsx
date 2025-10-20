import { BottomSheetBackgroundProps } from '@gorhom/bottom-sheet';
import { useColorScheme } from 'nativewind';
import React, { useEffect, useMemo } from 'react';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

const CustomBackground: React.FC<BottomSheetBackgroundProps> = ({ style }) => {
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // Sử dụng màu từ theme thay vì hardcode
  const backgroundColor = useSharedValue(isDarkMode ? 'rgb(22 22 22)' : 'rgb(249 250 251)');

  useEffect(() => {
    backgroundColor.value = isDarkMode ? 'rgb(22 22 22)' : 'rgb(249 250 251)';
  }, [backgroundColor, isDarkMode]);

  const containerAnimatedStyle = useAnimatedStyle(
    () => ({
      backgroundColor: backgroundColor.value,
    }),
    [backgroundColor],
  );

  const containerStyle = useMemo(
    () => [
      style,
      containerAnimatedStyle,
      {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden' as const,
        // Đảm bảo background hiển thị trên toàn bộ màn hình
        flex: 1,
      },
    ],
    [style, containerAnimatedStyle],
  );

  return <Animated.View pointerEvents="none" style={containerStyle} />;
};

export default CustomBackground;
