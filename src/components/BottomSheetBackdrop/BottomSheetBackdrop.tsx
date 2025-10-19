import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import React from 'react';

const CustomBackdropComponent: React.FC<BottomSheetBackdropProps> = (props) => (
  <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} pressBehavior="close" />
);

export default CustomBackdropComponent;
