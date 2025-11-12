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
    await keyringService.verifyPassword(password);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log('❌ apisLock.verifyPassword - Verification failed:', message);
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
