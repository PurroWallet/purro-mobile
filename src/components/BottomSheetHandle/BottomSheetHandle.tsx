import React from 'react';
import { View } from 'react-native';
import { type BottomSheetHandleProps } from '@gorhom/bottom-sheet';

const BottomSheetHandle: React.FC<BottomSheetHandleProps> = () => {
  return (
    <View className="items-center bg-[#373B43] px-6 py-3">
      <View className="h-1 w-10 rounded-full bg-[#8E8E93]" />
    </View>
  );
};

export default BottomSheetHandle;
