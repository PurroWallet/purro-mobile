import { useBottomSheetSpringConfigs } from '@gorhom/bottom-sheet';

export const useBottomSheetAnimationConfigs = () => {
  return useBottomSheetSpringConfigs({
    damping: 30,
    overshootClamping: true,
    restDisplacementThreshold: 0.5,
    restSpeedThreshold: 0.5,
    stiffness: 300,
  });
};
