import { AppState, AppStateStatus } from 'react-native';
import { lockService } from './LockService';

class ScreenProtectionService {
  private appStateSubscription: any;
  private autoLockTimeout: NodeJS.Timeout | null = null;
  private readonly AUTO_LOCK_DELAY = 5 * 60 * 1000; // 5 minutes

  init(): void {
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
  }

  private handleAppStateChange = (nextAppState: AppStateStatus): void => {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      // Start auto-lock timer when app goes to background
      this.startAutoLockTimer();
    } else if (nextAppState === 'active') {
      // Cancel auto-lock if user returns quickly
      this.cancelAutoLockTimer();
    }
  };

  private startAutoLockTimer(): void {
    this.autoLockTimeout = setTimeout(() => {
      if (!lockService.isLocked()) {
        lockService.lockWallet();
      }
    }, this.AUTO_LOCK_DELAY);
  }

  private cancelAutoLockTimer(): void {
    if (this.autoLockTimeout) {
      clearTimeout(this.autoLockTimeout);
      this.autoLockTimeout = null;
    }
  }

  cleanup(): void {
    this.appStateSubscription?.remove();
    this.cancelAutoLockTimer();
  }
}

export const screenProtection = new ScreenProtectionService();
