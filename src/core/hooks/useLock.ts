import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { apisWallet } from '../apis/wallet';

export function useIsOnBackground() {
  const [isOnBackground, setIsOnBackground] = useState(false);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      setIsOnBackground(nextAppState !== 'active');
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Initial state
    setIsOnBackground(AppState.currentState !== 'active');

    return () => {
      subscription.remove();
    };
  }, []);

  return { isOnBackground };
}

export function useSecureOnBackground() {
  const { isOnBackground } = useIsOnBackground();

  useEffect(() => {
    if (isOnBackground) {
      // Lock wallet when app goes to background
      apisWallet.lockWallet();
    }
  }, [isOnBackground]);

  return { isOnBackground };
}

export function useAppUnlocked() {
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const checkUnlock = () => {
      setIsUnlocked(!apisWallet.isLocked());
    };

    checkUnlock();

    // Check periodically (could be optimized with events)
    const interval = setInterval(checkUnlock, 1000);

    return () => clearInterval(interval);
  }, []);

  return isUnlocked;
}
