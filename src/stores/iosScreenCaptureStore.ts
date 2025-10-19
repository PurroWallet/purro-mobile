import { Platform } from 'react-native';
import { create } from 'zustand';

const isIOS = Platform.OS === 'ios';

interface IOSScreenCaptureState {
  isBeingCaptured: boolean;
  isScreenshotJustNow: boolean;
  setIsBeingCaptured: (value: boolean) => void;
  setScreenshotJustNow: (value: boolean) => void;
}

export const useIOSScreenCaptureStore = create<IOSScreenCaptureState>((set) => ({
  isBeingCaptured: isIOS ? false : false,
  isScreenshotJustNow: false,
  setIsBeingCaptured: (value) => set({ isBeingCaptured: value }),
  setScreenshotJustNow: (value) => set({ isScreenshotJustNow: value }),
}));
