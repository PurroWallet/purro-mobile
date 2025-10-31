import { keyringService, lockService } from '../services';

export type UnlockResult = {
  success: boolean;
  error: string;
  formFieldError?: string;
  toastError?: string;
};

export async function unlockWallet(password: string): Promise<UnlockResult> {
  const unlockResult: UnlockResult = {
    success: false,
    error: '',
    formFieldError: '',
    toastError: '',
  };

  try {
    // Boot keyring service (loads keyrings to get account addresses)
    await keyringService.boot(password);

    // Mark as unlocked in lock service
    lockService.markAsUnlocked();

    unlockResult.success = true;
  } catch (error) {
    unlockResult.error = 'Incorrect password';
    unlockResult.formFieldError = 'Incorrect password';
  }

  return unlockResult;
}

export async function verifyPassword(
  password: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🔐 apisLock.verifyPassword - Starting verification...');
    await keyringService.verifyPassword(password);
    console.log('✅ apisLock.verifyPassword - Password verified successfully');
    return { success: true };
  } catch (error) {
    console.log('❌ apisLock.verifyPassword - Verification failed:', error.message);
    return { success: false, error: 'Invalid password' };
  }
}

export async function lockWallet() {
  keyringService.lock();
}

export function isUnlocked() {
  return keyringService.isUnlocked();
}

// Export APIs object for convenience
export const apisLock = {
  unlockWallet,
  verifyPassword,
  lockWallet,
  isUnlocked,
  markAsUnlocked: () => lockService.markAsUnlocked(),
};
