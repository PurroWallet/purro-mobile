import { useCallback, useEffect } from 'react';
import { atom, useAtom } from 'jotai';
import { IS_IOS } from '@/core/native/utils';

// Mock RNScreenshotPrevent for compatibility
const RNScreenshotPrevent = {
  togglePreventScreenshot: (prevent: boolean) => {
    console.log(`Screenshot prevention ${prevent ? 'enabled' : 'disabled'}`);
  },
  iosIsBeingCaptured: () => false,
  iosOnScreenCaptureChanged: (
    callback: (ctx: { isBeingCaptured: boolean }) => void,
  ) => ({
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

const iosScreenCaptureAtom = atom({
  isBeingCaptured: IS_IOS ? RNScreenshotPrevent.iosIsBeingCaptured() : false,
  isScreenshotJustNow: false,
});

export function useIOSScreenIsBeingCaptured() {
  const [{ isBeingCaptured }] = useAtom(iosScreenCaptureAtom);

  return {
    isBeingCaptured,
  };
}

export function useIOSScreenRecording(options?: {
  isTop?: boolean;
  onIsBeingCapturedChanged?: (ctx: { isBeingCaptured: boolean }) => void;
}) {
  const [{ isBeingCaptured }, setIOSScreenCapture] =
    useAtom(iosScreenCaptureAtom);

  const { onIsBeingCapturedChanged, isTop } = options || {};

  useEffect(() => {
    if (!isTop) return;
    if (!IS_IOS) return;

    const { remove } = RNScreenshotPrevent.iosOnScreenCaptureChanged(ctx => {
      setIOSScreenCapture(prev => ({
        ...prev,
        isBeingCaptured: ctx.isBeingCaptured,
      }));
      onIsBeingCapturedChanged?.(ctx);
    });

    return () => {
      remove();
    };
  }, [isTop, setIOSScreenCapture, onIsBeingCapturedChanged]);

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
  const [{ isScreenshotJustNow }, setIOSScreenCapture] =
    useAtom(iosScreenCaptureAtom);

  const { onIsScreenshottedJustNow } = options || {};

  const clearScreenshotJustNow = useCallback(() => {
    setIOSScreenCapture(prev => ({ ...prev, isScreenshotJustNow: false }));
  }, [setIOSScreenCapture]);

  useEffect(() => {
    if (!IS_IOS) return;

    const { remove } = RNScreenshotPrevent.iosOnUserDidTakeScreenshot(() => {
      const setScreenshotted = (val?: boolean) =>
        setIOSScreenCapture(prev => ({ ...prev, isScreenshotJustNow: !!val }));
      onIsScreenshottedJustNow?.({ setScreenshotted });
    });

    return () => {
      remove();
    };
  }, [setIOSScreenCapture, onIsScreenshottedJustNow]);

  return {
    isScreenshotJustNow,
    clearScreenshotJustNow,
  };
}

/**
 * @description call this hook only once on the top level of your app
 */
export function useAppPreventScreenshotOnScreen({}: {
  isTop?: boolean;
} = {}) {
  // Screenshot prevention is handled by individual screen hooks
  // This hook is for future global prevention logic
  return {};
}
