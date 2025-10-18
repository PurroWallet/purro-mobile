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
    console.log('🔓 apisLock.unlockWallet - Starting unlock...');

    // Boot keyring service (this will load keyrings and unlock in one go)
    await keyringService.boot(password);

    console.log('🔓 apisLock.unlockWallet - Keyring booted');

    // Submit password (will skip if already unlocked)
    await keyringService.submitPassword(password);

    console.log('🔓 apisLock.unlockWallet - Password submitted');

    // Mark as unlocked in lock service
    lockService.markAsUnlocked();

    unlockResult.success = true;
    console.log('🔓 apisLock.unlockWallet - Unlock successful!');
  } catch (error) {
    console.error('🔓 apisLock.unlockWallet - Error:', error);
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
  } catch {
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
