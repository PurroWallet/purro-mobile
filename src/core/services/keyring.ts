/**
 * Keyring service for managing HD wallets and accounts
 * Following Rabby's keyring pattern with full HD wallet support
 */

import {
  HDKeyring,
  HDKeyringData,
  generateMnemonic,
  validateMnemonic,
} from './hdKeyring';
import { appEncryptor } from './encryptor';
import { keyringStorage } from '../storage/secureStorage';

export interface KeyringData {
  hdKeyrings: HDKeyringData[];
  currentAddress?: string;
}

/**
 * Keyring Service - Main service for managing HD wallets
 * Supports multiple HD keyrings with BIP44 derivation
 */
class KeyringService {
  private booted = false;
  private unlocked = false;
  private password = '';
  private hdKeyrings: HDKeyring[] = [];
  private keyringData: KeyringData = { hdKeyrings: [] };
  private passwordVerified = false; // Track if password was verified during boot

  /**
   * Boot the keyring service with password
   * Loads existing keyrings if available and auto-unlocks
   */
  async boot(password: string): Promise<void> {
    if (this.booted) {
      // If already booted with same password, just unlock
      if (this.password === password && this.passwordVerified) {
        this.unlocked = true;
        return;
      }
      // If different password, need to verify
      await this.verifyPassword(password);
      this.unlocked = true;
      return;
    }

    this.password = password;
    this.passwordVerified = false;

    // Try to load existing keyring first
    try {
      await this.loadKeyring(password);
      this.passwordVerified = true; // Password was verified during loadKeyring
      this.unlocked = true; // Auto-unlock if load successful
    } catch (error) {
      // If no existing keyring, initialize empty state
      this.keyringData = { hdKeyrings: [] };
      this.passwordVerified = false;
    }

    this.booted = true;
  }

  /**
   * Check if keyring is booted
   */
  isBooted(): boolean {
    return this.booted;
  }

  /**
   * Check if keyring is unlocked
   */
  isUnlocked(): boolean {
    return this.unlocked;
  }

  /**
   * Get current password (only when unlocked)
   */
  getPassword(): string | null {
    if (!this.unlocked) {
      return null;
    }
    return this.password;
  }

  /**
   * Generate new mnemonic phrase
   * @param strength - Bit strength (default 128 for 12 words)
   */
  generateMnemonic(strength: number = 128): string {
    return generateMnemonic(strength);
  }

  /**
   * Create new HD keyring from mnemonic
   * @param mnemonic - BIP39 mnemonic phrase
   * @param passphrase - Optional BIP39 passphrase
   * @returns Array of created account addresses
   */
  async createHDKeyring(
    mnemonic: string,
    passphrase?: string,
  ): Promise<string[]> {
    if (!this.booted) {
      throw new Error('Keyring service not booted');
    }

    console.time('✅ Validate Mnemonic');
    if (!validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic phrase');
    }
    console.timeEnd('✅ Validate Mnemonic');

    // Create new HD keyring with one account
    console.time('🔑 New HDKeyring');
    const keyring = new HDKeyring({
      mnemonic,
      passphrase,
      numberOfAccounts: 1,
    });
    console.timeEnd('🔑 New HDKeyring');

    this.hdKeyrings.push(keyring);
    this.unlocked = true;

    console.time('📍 Get Addresses');
    const addresses = keyring.getAccounts();
    console.timeEnd('📍 Get Addresses');

    // Set first account as current
    if (addresses.length > 0 && !this.keyringData.currentAddress) {
      this.keyringData.currentAddress = addresses[0];
    }

    return addresses;
  }

  /**
   * Legacy method - create keyring (redirects to HD keyring)
   * For backward compatibility
   */
  async createKeyring(mnemonic: string): Promise<string[]> {
    return this.createHDKeyring(mnemonic);
  }

  /**
   * Add new accounts to the first HD keyring
   * @param count - Number of accounts to add
   * @returns Array of new account addresses
   */
  async addAccounts(count: number = 1): Promise<string[]> {
    if (!this.unlocked) {
      throw new Error('Keyring is locked');
    }

    if (this.hdKeyrings.length === 0) {
      throw new Error('No HD keyring available');
    }

    // Add accounts to the first HD keyring
    return this.hdKeyrings[0].addAccounts(count);
  }

  /**
   * Get all accounts from all HD keyrings
   */
  getAllAccounts(): string[] {
    return this.hdKeyrings.flatMap(kr => kr.getAccounts());
  }

  /**
   * Legacy method - get accounts
   */
  getAccounts(): string[] {
    return this.getAllAccounts();
  }

  /**
   * Get account info by address
   * @param address - Account address
   * @returns Account info or null
   */
  getAccountByAddress(address: string): any | null {
    for (const keyring of this.hdKeyrings) {
      const account = keyring.getAccountByAddress(address);
      if (account) {
        return account;
      }
    }
    return null;
  }

  /**
   * Get private key for address
   * @param address - Account address
   * @returns Private key or null
   */
  getPrivateKeyByAddress(address: string): string | null {
    const account = this.getAccountByAddress(address);
    return account ? account.privateKey : null;
  }

  /**
   * Export private key for an account
   * @param address - Account address
   * @returns Private key string
   */
  exportPrivateKey(address: string): string {
    if (!this.unlocked) {
      throw new Error('Keyring is locked');
    }

    for (const keyring of this.hdKeyrings) {
      const account = keyring.getAccountByAddress(address);
      if (account) {
        return account.privateKey;
      }
    }

    throw new Error('Account not found');
  }

  /**
   * Export mnemonic for a keyring
   * WARNING: Only call when user explicitly requests
   * @param keyringIndex - Index of keyring (default 0)
   * @returns Mnemonic phrase
   */
  exportMnemonic(keyringIndex: number = 0): string {
    if (!this.unlocked) {
      throw new Error('Keyring is locked');
    }

    if (keyringIndex >= this.hdKeyrings.length) {
      throw new Error('Keyring not found');
    }

    return this.hdKeyrings[keyringIndex].getMnemonic();
  }

  /**
   * Persist all keyrings to encrypted storage
   * @param password - Password to encrypt with
   */
  async persistAllKeyrings(password: string): Promise<void> {
    if (!this.booted) {
      throw new Error('Keyring service not booted');
    }

    try {
      // Serialize all HD keyrings
      const data: KeyringData = {
        hdKeyrings: this.hdKeyrings.map(kr => kr.serialize()),
        currentAddress: this.keyringData.currentAddress,
      };

      // Check if we have data to save
      if (data.hdKeyrings.length === 0) {
        throw new Error('No keyring data to save');
      }

      // Encrypt and save (skip verification for speed)
      const encrypted = await appEncryptor.encrypt(password, data);
      keyringStorage.setItem('vault', encrypted);

      this.password = password;
    } catch (error) {
      console.error('❌ Failed to persist keyrings:', error);
      throw new Error(
        `Failed to save wallet: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  /**
   * Load keyring from encrypted storage
   * @param password - Password to decrypt with
   */
  private async loadKeyring(password: string): Promise<void> {
    console.time('🔐 Load Keyring Total');
    const encryptedVault = keyringStorage.getItem<string>('vault');

    if (!encryptedVault) {
      this.keyringData = { hdKeyrings: [] };
      return;
    }

    console.time('🔓 Decrypt Vault');
    const decrypted = await appEncryptor.decrypt(password, encryptedVault);
    console.timeEnd('🔓 Decrypt Vault');

    this.keyringData = decrypted;

    // Restore HD keyrings from serialized data
    console.time('🔑 Restore Keyrings');
    this.hdKeyrings = decrypted.hdKeyrings.map(
      (data: HDKeyringData) => new HDKeyring(data),
    );
    console.timeEnd('🔑 Restore Keyrings');

    this.unlocked = true;
    console.log(`✅ Loaded ${this.hdKeyrings.length} HD keyring(s)`);
    console.timeEnd('🔐 Load Keyring Total');
  }

  /**
   * Verify password against stored vault
   * @param password - Password to verify
   */
  async verifyPassword(password: string): Promise<void> {
    // If password was already verified during boot, skip verification
    if (this.passwordVerified && this.password === password) {
      console.log('⚡ Password already verified, skipping');
      return;
    }

    console.time('🔐 Password Verification');
    const encryptedVault = keyringStorage.getItem<string>('vault');

    if (!encryptedVault) {
      throw new Error('No vault found');
    }

    try {
      await appEncryptor.decrypt(password, encryptedVault);
      this.passwordVerified = true;
      console.log('✅ Password verified successfully');
    } catch (error) {
      console.log('❌ Password verification failed');
      throw new Error('Incorrect password');
    } finally {
      console.timeEnd('🔐 Password Verification');
    }
  }

  /**
   * Submit password to unlock keyring
   * @param password - Password to unlock with
   */
  async submitPassword(password: string): Promise<void> {
    console.time('📝 Submit Password');

    // Only verify if not already verified
    if (!this.passwordVerified || this.password !== password) {
      console.log('🔍 Need to verify password');
      await this.verifyPassword(password);
    } else {
      console.log('⚡ Password already verified, skipping verification');
    }

    this.password = password;
    this.unlocked = true;
    console.log('🔓 Keyring unlocked');
    console.timeEnd('📝 Submit Password');
  }

  /**
   * Update password
   * @param oldPassword - Current password
   * @param newPassword - New password
   */
  async updatePassword(
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    await this.verifyPassword(oldPassword);
    await this.persistAllKeyrings(newPassword);
    this.password = newPassword;
  }

  /**
   * Reset password (dangerous - will clear all data if wrong old password)
   */
  async resetPassword(newPassword: string): Promise<void> {
    this.keyringData = { hdKeyrings: [] };
    this.hdKeyrings = [];
    await this.persistAllKeyrings(newPassword);
    this.password = newPassword;
  }

  /**
   * Dangerously reset password and keyrings
   */
  async dangerouslyResetPasswordAndKeyrings(
    oldPassword: string,
    newPassword?: string,
  ): Promise<void> {
    await this.verifyPassword(oldPassword);
    this.hdKeyrings = [];
    this.keyringData = { hdKeyrings: [] };
    if (newPassword) {
      await this.persistAllKeyrings(newPassword);
    } else {
      keyringStorage.removeItem('vault');
    }
  }

  /**
   * Get current active address
   */
  getCurrentAddress(): string | undefined {
    return this.keyringData.currentAddress;
  }

  /**
   * Set current active address
   * @param address - Address to set as current
   */
  setCurrentAddress(address: string): void {
    const allAccounts = this.getAllAccounts();
    if (!allAccounts.includes(address)) {
      throw new Error('Address not found in keyrings');
    }
    this.keyringData.currentAddress = address;
  }

  /**
   * Lock keyring
   */
  lock(): void {
    this.unlocked = false;
    this.password = '';
    console.log('🔒 Keyring locked');
  }

  /**
   * Clear all data (dangerous!)
   */
  clearAll(): void {
    this.hdKeyrings = [];
    this.keyringData = { hdKeyrings: [] };
    this.unlocked = false;
    this.password = '';
    this.booted = false;
    keyringStorage.removeItem('vault');
    console.log('🗑️ All keyring data cleared');
  }

  /**
   * Get count of accounts
   */
  async getCountOfAccountsInKeyring(): Promise<number> {
    return this.getAllAccounts().length;
  }
}

export const keyringService = new KeyringService();
