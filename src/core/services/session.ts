/**
 * Session service for managing app session state
 */

import { MMKV } from 'react-native-mmkv';
import { MMKV_FILE_NAMES } from '../storage';

let storage: MMKV | null = null;

const getStorage = (): MMKV => {
  if (!storage) {
    try {
      storage = new MMKV({
        id: MMKV_FILE_NAMES.SESSION,
      });
    } catch (error) {
      throw new Error(
        'MMKV requires JSI. Please disable Chrome/Remote debugger and reload the app.',
      );
    }
  }
  return storage;
};

export interface SessionData {
  lastUnlockTime?: number;
  isUnlocked: boolean;
  currentAccountAddress?: string;
}

class SessionService {
  private sessionData: SessionData = {
    isUnlocked: false,
  };

  constructor() {
    this.loadSession();
  }

  private loadSession(): void {
    try {
      const data = getStorage().getString('session');
      if (data) {
        this.sessionData = JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  }

  private saveSession(): void {
    try {
      getStorage().set('session', JSON.stringify(this.sessionData));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  }

  isUnlocked(): boolean {
    return this.sessionData.isUnlocked;
  }

  setUnlocked(unlocked: boolean): void {
    this.sessionData.isUnlocked = unlocked;
    if (unlocked) {
      this.sessionData.lastUnlockTime = Date.now();
    }
    this.saveSession();
  }

  getLastUnlockTime(): number | undefined {
    return this.sessionData.lastUnlockTime;
  }

  setCurrentAccount(address: string): void {
    this.sessionData.currentAccountAddress = address;
    this.saveSession();
  }

  getCurrentAccount(): string | undefined {
    return this.sessionData.currentAccountAddress;
  }

  clearSession(): void {
    this.sessionData = {
      isUnlocked: false,
    };
    this.saveSession();
  }
}

export const sessionService = new SessionService();
