import { secureWalletStorage } from '../storage/secureStorage';
import { encryptionService } from './EncryptionService';

/**
 * Password Service - Manages password verification and key derivation
 * Following Rabby's architecture but optimized for mobile with MMKV storage
 */
export class PasswordService {
  private passwordVault: string | null = null;
  private unlocked: boolean = false;

  constructor() {
    // Try to load password vault from secure storage
    this.loadPasswordVault();
  }

  // Create password vault with initial password
  async createPasswordVault(password: string): Promise<void> {
    // Derive a key from the password with salt
    const { key: derivedKey, salt } = await this.deriveKey(password);

    // Store the derived key and salt in secure storage
    secureWalletStorage.setItem('passwordVault', { key: derivedKey, salt });

    this.passwordVault = derivedKey;
    this.unlocked = true;
  }

  // Unlock password vault with password
  async unlockPasswordVault(password: string): Promise<boolean> {
    try {
      // Get stored password vault
      const storedVault = secureWalletStorage.getItem<{
        key: string;
        salt: string;
      }>('passwordVault');

      if (!storedVault) {
        return false;
      }

      // Derive key using stored salt
      const { key: derivedKey } = await this.deriveKey(password, storedVault.salt);

      // Use constant-time comparison to prevent timing attacks
      if (this.constantTimeEquals(derivedKey, storedVault.key)) {
        this.passwordVault = derivedKey;
        this.unlocked = true;
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  // Lock password vault
  lockPasswordVault(): void {
    this.unlocked = false;
    this.passwordVault = null;
  }

  // Check if password vault is unlocked
  isUnlocked(): boolean {
    return this.unlocked;
  }

  // Get password vault status
  hasPasswordVault(): boolean {
    return !!secureWalletStorage.getItem('passwordVault');
  }

  // Update password vault with new password
  async updatePasswordVault(oldPassword: string, newPassword: string): Promise<void> {
    if (!this.unlocked) {
      throw new Error('Password vault is locked');
    }

    // Verify old password
    const isValid = await this.unlockPasswordVault(oldPassword);
    if (!isValid) {
      throw new Error('Invalid old password');
    }

    // Create new password vault
    await this.createPasswordVault(newPassword);
  }

  // Derive key from password using PBKDF2 with stored salt
  private async deriveKey(
    password: string,
    storedSalt?: string,
  ): Promise<{ key: string; salt: string }> {
    let salt: Buffer;

    if (storedSalt) {
      // Use stored salt for verification
      salt = Buffer.from(storedSalt, 'base64');
    } else {
      // Generate new cryptographically secure salt
      salt = await encryptionService.generateRandomBytes(16);
    }

    // Derive key using PBKDF2
    const key = await encryptionService.deriveKey(password, salt);

    // Return key and salt
    return {
      key: key.toString('base64'),
      salt: salt.toString('base64'),
    };
  }

  // Load password vault from secure storage
  private loadPasswordVault(): void {
    try {
      const vault = secureWalletStorage.getItem<{ key: string; salt: string }>('passwordVault');
      if (vault) {
        this.passwordVault = vault.key;
      }
    } catch {
      // Ignore errors during initialization
    }
  }

  // Clear password vault
  clearPasswordVault(): void {
    secureWalletStorage.removeItem('passwordVault');
    this.passwordVault = null;
    this.unlocked = false;
  }

  // Constant-time string comparison to prevent timing attacks
  private constantTimeEquals(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }
}

export const passwordService = new PasswordService();
