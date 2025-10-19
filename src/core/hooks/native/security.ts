import { useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { useIOSScreenCaptureStore } from '@/stores/iosScreenCaptureStore';

// Mock RNScreenshotPrevent for compatibility
const RNScreenshotPrevent = {
  togglePreventScreenshot: (prevent: boolean) => {
    console.log(`Screenshot prevention ${prevent ? 'enabled' : 'disabled'}`);
  },
  iosIsBeingCaptured: () => false,
  iosOnScreenCaptureChanged: (callback: (ctx: { isBeingCaptured: boolean }) => void) => ({
    remove: () => callback,
  }),
  iosOnUserDidTakeScreenshot: (callback: () => void) => ({
    remove: () => callback,
  }),
};

const globalScreenCapturableRef = { current: true };
export function getGlobalScreenCapturable() {
  return globalScreenCapturableRef.current;
}

/**
 * @description Prevents the user from taking a screenshot,
 * call this hook on top of your App
 */
export function usePreventScreenshot(prevent = true, { isTop = false } = {}) {
  useEffect(() => {
    if (!isTop) {
      console.warn('usePreventScreenshot is not on top');
      return;
    }

    globalScreenCapturableRef.current = !prevent;
    if (!prevent) {
      RNScreenshotPrevent.togglePreventScreenshot(false);
      return;
    }

    RNScreenshotPrevent.togglePreventScreenshot(true);

    return () => {
      RNScreenshotPrevent.togglePreventScreenshot(false);
    };
  }, [prevent, isTop]);
}

export function useIOSScreenIsBeingCaptured() {
  const isBeingCaptured = useIOSScreenCaptureStore((state) => state.isBeingCaptured);

  return {
    isBeingCaptured,
  };
}

export function useIOSScreenRecording(options?: {
  isTop?: boolean;
  onIsBeingCapturedChanged?: (ctx: { isBeingCaptured: boolean }) => void;
}) {
  const isBeingCaptured = useIOSScreenCaptureStore((state) => state.isBeingCaptured);
  const setIsBeingCaptured = useIOSScreenCaptureStore((state) => state.setIsBeingCaptured);

  const { onIsBeingCapturedChanged, isTop } = options || {};

  useEffect(() => {
    if (!isTop) return;
    if (Platform.OS !== 'ios') return;

    const { remove } = RNScreenshotPrevent.iosOnScreenCaptureChanged((ctx) => {
      setIsBeingCaptured(ctx.isBeingCaptured);
      onIsBeingCapturedChanged?.(ctx);
    });

    return () => {
      remove();
    };
  }, [isTop, setIsBeingCaptured, onIsBeingCapturedChanged]);

  return {
    isBeingCaptured,
  };
}

export function useIOSScreenshotted(options?: {
  isTop?: boolean;
  onIsScreenshottedJustNow?: (ctx: {
    setScreenshotted: (isScreenshotJustNow: boolean) => void;
  }) => void;
}) {
  const isScreenshotJustNow = useIOSScreenCaptureStore((state) => state.isScreenshotJustNow);
  const setScreenshotJustNow = useIOSScreenCaptureStore((state) => state.setScreenshotJustNow);

  const { onIsScreenshottedJustNow } = options || {};

  const clearScreenshotJustNow = useCallback(() => {
    setScreenshotJustNow(false);
  }, [setScreenshotJustNow]);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    const { remove } = RNScreenshotPrevent.iosOnUserDidTakeScreenshot(() => {
      const setScreenshotted = (val?: boolean) => setScreenshotJustNow(!!val);
      onIsScreenshottedJustNow?.({ setScreenshotted });
    });

    return () => {
      remove();
    };
  }, [setScreenshotJustNow, onIsScreenshottedJustNow]);

  return {
    isScreenshotJustNow,
    clearScreenshotJustNow,
  };
}

/**
 * @description call this hook only once on the top level of your app
 */
export function useAppPreventScreenshotOnScreen({}: { isTop?: boolean } = {}) {
  // Screenshot prevention is handled by individual screen hooks
  // This hook is for future global prevention logic
  return {};
}
