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
    await keyringService.boot(password);
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
    return { success: false, error: 'Invalid password' };
  }
}

export async function lockWallet() {
  keyringService.lock();
}

export function isUnlocked() {
  return keyringService.isUnlocked();
}

export const apisLock = {
  unlockWallet,
  verifyPassword,
  lockWallet,
  isUnlocked,
  markAsUnlocked: () => lockService.markAsUnlocked(),
};
