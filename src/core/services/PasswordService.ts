import { encryptionService } from './EncryptionService';
import { secureWalletStorage } from '../storage/secureStorage';

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
    // Derive a key from the password
    const derivedKey = await this.deriveKey(password);
    
    // Store the derived key in secure storage
    secureWalletStorage.setItem('passwordVault', derivedKey);
    
    this.passwordVault = derivedKey;
    this.unlocked = true;
  }
  
  // Unlock password vault with password
  async unlockPasswordVault(password: string): Promise<boolean> {
    try {
      // Derive a key from the password
      const derivedKey = await this.deriveKey(password);
      
      // Get stored password vault
      const storedVault = secureWalletStorage.getItem<string>('passwordVault');
      
      if (!storedVault) {
        return false;
      }
      
      // Verify the derived key matches stored vault
      if (derivedKey === storedVault) {
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
  
  // Derive key from password using PBKDF2
  private async deriveKey(password: string): Promise<string> {
    // Generate a random salt
    const salt = encryptionService.generateRandomBytes(16);
    
    // Derive key using PBKDF2
    const key = await encryptionService.deriveKey(password, salt);
    
    // Return base64 encoded key
    return key.toString('base64');
  }
  
  // Load password vault from secure storage
  private loadPasswordVault(): void {
    try {
      const vault = secureWalletStorage.getItem<string>('passwordVault');
      if (vault) {
        this.passwordVault = vault;
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
}

export const passwordService = new PasswordService();