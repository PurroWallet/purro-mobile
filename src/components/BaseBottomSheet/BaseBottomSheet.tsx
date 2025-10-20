import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from 'react';
import { Platform, View } from 'react-native';
import CustomBackground from '@/components/BaseBottomSheet/CustomBackground';
import CustomHandle from '@/components/BaseBottomSheet/CustomHandle';
import { useBottomSheetAnimationConfigs } from '@/core/hooks/useBottomSheetAnimationConfigs';

interface BaseBottomSheetProps {
  onClose: () => void;
  snapPoints: string[];
  children: React.ReactNode;
  enableHandle?: boolean;
  stackBehavior?: 'push' | 'replace';
  enableDynamicSizing?: boolean;
  keyboardBehavior?: 'interactive' | 'extend' | 'fillParent' | undefined;
  keyboardBlurBehavior?: 'restore' | 'none' | undefined;
}

export interface BaseBottomSheetRef {
  present: () => void;
  dismiss: () => void;
}

const BaseBottomSheet = forwardRef<BaseBottomSheetRef, BaseBottomSheetProps>(
  (
    {
      onClose,
      snapPoints,
      children,
      enableHandle = true,
      stackBehavior = 'push',
      enableDynamicSizing = false,
      keyboardBehavior,
      keyboardBlurBehavior,
    },
    ref,
  ) => {
    const bottomSheetRef = useRef<BottomSheetModalMethods>(null);

    // Custom animation configs
    const animationConfigs = useBottomSheetAnimationConfigs();

    // Custom backdrop
    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior="close"
        />
      ),
      [],
    );

    // Custom background
    const renderBackground = useCallback((props: any) => <CustomBackground {...props} />, []);

    // Custom handle with rounded corners
    const renderHandle = useCallback(
      (props: any) => {
        if (enableHandle) {
          return <CustomHandle {...props} />;
        }
        return null;
      },
      [enableHandle],
    );

    // Expose present/dismiss methods
    useImperativeHandle(ref, () => ({
      present: () => {
        bottomSheetRef.current?.present();
      },
      dismiss: () => {
        bottomSheetRef.current?.dismiss();
      },
    }));

    return (
      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        animationConfigs={animationConfigs}
        stackBehavior={stackBehavior}
        enableDynamicSizing={enableDynamicSizing}
        onChange={(index: number) => {
          if (index === -1) {
            onClose();
          }
        }}
        backgroundComponent={renderBackground}
        handleComponent={renderHandle}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={true}
        keyboardBehavior={keyboardBehavior as any}
        keyboardBlurBehavior={keyboardBlurBehavior}
      >
        {children}
      </BottomSheetModal>
    );
  },
);

export default BaseBottomSheet;
