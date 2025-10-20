# React Native Bottom Sheet Analysis

## Vấn đề hiện tại
- Lỗi `TypeError: ref.current.unstable_getBoundingClientRect is not a function (it is undefined)`
- Lỗi xảy ra khi sử dụng custom handle component

## Phân tích từ Documentation

### 1. Cách implement Custom Handle đúng chuẩn

#### Version 4 (được khuyến nghị)
```tsx
import React, { useMemo } from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { BottomSheetHandleProps } from "@gorhom/bottom-sheet";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated";
import { toRad } from "react-native-redash";

// @ts-ignore
export const transformOrigin = ({ x, y }, ...transformations) => {
  "worklet";
  return [
    { translateX: x },
    { translateY: y },
    ...transformations,
    { translateX: x * -1 },
    { translateY: y * -1 },
  ];
};

interface HandleProps extends BottomSheetHandleProps {
  style?: StyleProp<ViewStyle>;
}

const Handle: React.FC<HandleProps> = ({ style, animatedIndex }) => {
  //#region animations
  const indicatorTransformOriginY = useDerivedValue(() =>
    interpolate(animatedIndex.value, [0, 1, 2], [-1, 0, 1], Extrapolate.CLAMP)
  );
  //#endregion

  //#region styles
  const containerStyle = useMemo(() => [styles.header, style], [style]);
  const containerAnimatedStyle = useAnimatedStyle(() => {
    const borderTopRadius = interpolate(
      animatedIndex.value,
      [1, 2],
      [20, 0],
      Extrapolate.CLAMP
    );
    return {
      borderTopLeftRadius: borderTopRadius,
      borderTopRightRadius: borderTopRadius,
    };
  });
  // ... rest of the implementation
};
```

#### Version 2 (cũ hơn)
```tsx
import React, { useMemo } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { BottomSheetHandleProps } from '@gorhom/bottom-sheet';
import Animated, { interpolate, Extrapolate } from 'react-native-reanimated';
import { transformOrigin, toRad } from 'react-native-redash';

interface HandleProps extends BottomSheetHandleProps {}

const Handle: React.FC<HandleProps> = ({ animatedIndex }) => {
  // Direct interpolation without useDerivedValue
  const borderTopRadius = useMemo(
    () =>
      interpolate(animatedIndex, {
        inputRange: [1, 2],
        outputRange: [20, 0],
        extrapolate: Extrapolate.CLAMP,
      }),
    [animatedIndex]
  );
  // ...
};
```

### 2. Key Differences giữa các phiên bản

1. **Version 2**: Sử dụng `interpolate` trực tiếp trên `animatedIndex`
2. **Version 4+**: Sử dụng `useDerivedValue` và `useAnimatedStyle`
3. **Cần react-native-redash**: Cho `toRad` và `transformOrigin` utilities

### 3. Modal Usage Pattern

```tsx
import React, { useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';

const App = () => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['25%', '50%'], []);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <BottomSheetModalProvider>
        <Button onPress={handlePresentModalPress} title="Present Modal" />
        <BottomSheetModal
          ref={bottomSheetModalRef}
          snapPoints={snapPoints}
          handleComponent={CustomHandle} // Custom handle here
        >
          <BottomSheetView style={styles.contentContainer}>
            <Text>Awesome 🎉</Text>
          </BottomSheetView>
        </BottomSheetModal>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};
```

## Phân tích vấn đề trong project hiện tại

### 1. Version đang sử dụng
- Package.json shows: `"@gorhom/bottom-sheet": "^5"`
- Đây là version mới nhất

### 2. Implementation hiện tại
```tsx
const CustomHandle = forwardRef<any, CustomHandleProps>(({ animatedIndex, style }, ref) => {
  // ...
  return (
    <Animated.View
      ref={ref}  // <-- CÓ VẤN ĐỀ Ở ĐÂY
      style={...}
    >
      // ...
    </Animated.View>
  );
});
```

### 3. Vấn đề tiềm ẩn

1. **Ref forwarding**: Custom handle component không cần forward ref
2. **AnimatedIndex access**: Cần access `.value` property
3. **Missing react-native-redash**: Project có thể thiếu dependency này

## Solution đề xuất

### Option 1: Simple handle (không cần animation phức tạp)
```tsx
import React from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { BottomSheetHandleProps } from "@gorhom/bottom-sheet";
import { useColorScheme } from "nativewind";

interface CustomHandleProps extends BottomSheetHandleProps {
  style?: StyleProp<ViewStyle>;
}

const CustomHandle: React.FC<CustomHandleProps> = ({ style }) => {
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDarkMode ? "#373B43" : "#ffffff",
        },
        style,
      ]}
    >
      <View
        style={[
          styles.indicator,
          {
            backgroundColor: isDarkMode ? "#8E8E93" : "#9CA3AF",
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  indicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
});

export default CustomHandle;
```

### Option 2: Animated handle (với react-native-redash)
```tsx
import React, { useMemo } from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import { BottomSheetHandleProps } from "@gorhom/bottom-sheet";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated";
import { toRad } from "react-native-redash";
import { useColorScheme } from "nativewind";

// @ts-ignore
export const transformOrigin = ({ x, y }, ...transformations) => {
  "worklet";
  return [
    { translateX: x },
    { translateY: y },
    ...transformations,
    { translateX: x * -1 },
    { translateY: y * -1 },
  ];
};

interface CustomHandleProps extends BottomSheetHandleProps {
  style?: StyleProp<ViewStyle>;
}

const CustomHandle: React.FC<CustomHandleProps> = ({ style, animatedIndex }) => {
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const indicatorTransformOriginY = useDerivedValue(() =>
    interpolate(animatedIndex.value, [0, 1, 2], [-1, 0, 1], Extrapolate.CLAMP)
  );

  const containerAnimatedStyle = useAnimatedStyle(() => {
    const borderTopRadius = interpolate(
      animatedIndex.value,
      [1, 2],
      [20, 0],
      Extrapolate.CLAMP
    );
    return {
      borderTopLeftRadius: borderTopRadius,
      borderTopRightRadius: borderTopRadius,
    };
  });

  // ... rest of animated implementation
};
```

## Root Cause Analysis

1. **Ref issue**: `unstable_getBoundingClientRect` error thường xảy ra khi ref không được handle đúng cách
2. **Version mismatch**: Code đang mix patterns từ different versions
3. **Missing dependency**: Thiếu `react-native-redash` nếu dùng animation phức tạp

## Next Steps

1. Test với simple handle trước (Option 1)
2. Nếu cần animation phức tạp, install react-native-redash và implement Option 2
3. Đảm bảo không forward ref trong custom handle component