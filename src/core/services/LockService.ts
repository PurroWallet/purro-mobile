import { keyringService } from './KeyringService';
import { secureWalletStorage } from '../storage/secureStorage';

export interface UnlockResult {
  success: boolean;
  error?: string;
  usedBiometrics?: boolean;
}

export class LockService {
  private locked = true;
  private lastUnlockTime = 0;
  private failedAttempts = 0;
  private lockoutUntil = 0;
  private currentAddress: string | undefined;

  private readonly MAX_FAILED_ATTEMPTS = 100;
  private readonly LOCKOUT_DURATION = 15; // 15 minutes

  async unlockWallet(password: string): Promise<UnlockResult> {
    // Check rate limiting
    if (!this.canAttemptUnlock()) {
      return {
        success: false,
        error: `Too many failed attempts. Locked until ${new Date(
          this.lockoutUntil,
        ).toLocaleTimeString()}`,
      };
    }

    try {
      console.time('🔓 Total Unlock');
      console.log('🚀 Starting unlock process...');

      // Check if already booted and unlocked with same password
      if (keyringService.isBooted() && keyringService.isUnlocked()) {
        console.log('⚡ Already unlocked, skipping boot');
      } else {
        // Boot with auto-unlock
        console.time('🔧 Boot Process');
        await keyringService.boot(password);
        console.timeEnd('🔧 Boot Process');

        if (!keyringService.isUnlocked()) {
          console.log('❌ Boot failed to unlock');
          throw new Error('Failed to unlock');
        }
        console.log('✅ Unlocked via boot');
      }

      this.locked = false;
      this.lastUnlockTime = Date.now();
      this.resetFailedAttempts();

      console.timeEnd('🔓 Total Unlock');
      return { success: true };
    } catch (error) {
      this.recordFailedAttempt();
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Incorrect password',
      };
    }
  }

  async unlockWithBiometrics(): Promise<UnlockResult> {
    // Simple implementation without keychain for now
    return { 
      success: false, 
      error: 'Biometric authentication not available' 
    };
  }

  async enableBiometrics(_password: string): Promise<boolean> {
    // Simple implementation without keychain for now
    return false;
  }

  async disableBiometrics(): Promise<boolean> {
    // Simple implementation without keychain for now
    return false;
  }

  lockWallet(): void {
    this.locked = true;
    keyringService.lock();
  }

  isLocked(): boolean {
    return this.locked;
  }

  markAsUnlocked(): void {
    this.locked = false;
    this.lastUnlockTime = Date.now();
  }

  async updateUnlockTime(): Promise<void> {
    this.lastUnlockTime = Date.now();
    // Could add additional unlock time tracking logic here if needed
  }

  getFailedAttempts(): number {
    return this.failedAttempts;
  }

  getLockoutRemainingTime(): number {
    const remaining = this.lockoutUntil - Date.now();
    return Math.max(0, remaining);
  }

  getCurrentAddress(): string | undefined {
    return this.currentAddress;
  }

  setCurrentAddress(address: string): void {
    this.currentAddress = address;
  }

  getAutoLockTime(): number {
    return 15; // Default 15 minutes
  }

  setAutoLockTime(_minutes: number): void {
    // Implementation for custom auto-lock time
  }

  isBiometricsEnabled(): boolean {
    return false; // Simple implementation
  }

  private canAttemptUnlock(): boolean {
    if (Date.now() < this.lockoutUntil) {
      return false;
    }
    return true;
  }

  private recordFailedAttempt(): void {
    this.failedAttempts++;

    if (this.failedAttempts >= this.MAX_FAILED_ATTEMPTS) {
      this.lockoutUntil = Date.now() + this.LOCKOUT_DURATION;
      secureWalletStorage.setItem('lockout_until', this.lockoutUntil);
    }

    secureWalletStorage.setItem('failed_attempts', this.failedAttempts);
  }

  private resetFailedAttempts(): void {
    this.failedAttempts = 0;
    this.lockoutUntil = 0;
    secureWalletStorage.removeItem('failed_attempts');
    secureWalletStorage.removeItem('lockout_until');
  }
}

export const lockService = new LockService();