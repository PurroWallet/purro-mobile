/**
 * Wallet API - Unified interface for wallet operations
 * Clean separation of concerns following Rabby's architecture
 */

import { keyringService } from '../services/keyring';
import { lockService } from '../services/lock';
import { secureKeychain } from '../services/keychain';
import { keyringStorage } from '../storage/secureStorage';

export interface WalletAccount {
  address: string;
  balance?: string;
}

/**
 * Wallet APIs - Main public interface for wallet operations
 */
export const apisWallet = {
  // ============ Wallet Creation & Management ============

  /**
   * Create new wallet with mnemonic and password
   * @param password - User password
   * @param mnemonic - Optional mnemonic (generates new if not provided)
   * @returns Created wallet addresses
   */
  async createWallet(
    password: string,
    mnemonic?: string,
  ): Promise<{ addresses: string[]; mnemonic: string }> {
    const mnemonicToUse = mnemonic || keyringService.generateMnemonic();

    // Boot keyring with temporary password
    await keyringService.boot('temp_password');

    // Create HD keyring
    const addresses = await keyringService.createHDKeyring(mnemonicToUse);

    // Persist with user password
    await keyringService.persistAllKeyrings(password);

    console.log(`✅ Wallet created with ${addresses.length} account(s)`);

    return { addresses, mnemonic: mnemonicToUse };
  },

  /**
   * Import wallet from mnemonic
   * @param mnemonic - BIP39 mnemonic phrase
   * @param password - User password
   * @param passphrase - Optional BIP39 passphrase
   * @returns Imported wallet addresses
   */
  async importWallet(
    mnemonic: string,
    password: string,
    passphrase?: string,
  ): Promise<{ addresses: string[] }> {
    // Boot keyring service (don't load existing vault)
    console.time('🔧 Boot Keyring');
    if (!keyringService.isBooted()) {
      await keyringService.boot(password);
    }
    console.timeEnd('🔧 Boot Keyring');

    // Create HD keyring with mnemonic
    console.time('🔑 Create HD Keyring');
    const addresses = await keyringService.createHDKeyring(
      mnemonic,
      passphrase,
    );
    console.timeEnd('🔑 Create HD Keyring');

    // Persist with user password (optimized version)
    console.time('💾 Persist Keyrings');
    await keyringService.persistAllKeyrings(password);
    console.timeEnd('💾 Persist Keyrings');

    // Mark wallet as unlocked after successful import
    console.time('🔓 Mark Unlocked');
    lockService.markAsUnlocked();
    await lockService.updateUnlockTime();
    console.timeEnd('🔓 Mark Unlocked');

    return { addresses };
  },

  /**
   * Generate new mnemonic phrase
   * @param strength - Bit strength (128, 160, 192, 224, 256)
   * @returns Mnemonic string
   */
  generateMnemonic(strength: number = 128): string {
    return keyringService.generateMnemonic(strength);
  },

  /**
   * Check if wallet exists
   * @returns True if wallet exists
   */
  hasWallet(): boolean {
    const vault = keyringStorage.getItem<string>('vault');
    console.log(
      '🔍 hasWallet check - vault exists:',
      !!vault,
      'length:',
      vault?.length || 0,
    );
    return !!vault;
  },

  // ============ Account Management ============

  /**
   * Add new account to wallet
   * @param count - Number of accounts to add
   * @returns Array of new account addresses
   */
  async addAccount(count: number = 1): Promise<string[]> {
    const newAddresses = await keyringService.addAccounts(count);

    // Persist changes
    const currentPassword = (keyringService as any).password;
    if (currentPassword) {
      await keyringService.persistAllKeyrings(currentPassword);
    }

    console.log(`✅ Added ${count} new account(s)`);
    return newAddresses;
  },

  /**
   * Get all accounts
   * @returns Array of account addresses
   */
  getAllAccounts(): string[] {
    return keyringService.getAllAccounts();
  },

  /**
   * Get current active account
   * @returns Current account or null
   */
  getCurrentAccount(): WalletAccount | null {
    const currentAddress = keyringService.getCurrentAddress();

    if (!currentAddress) {
      const accounts = keyringService.getAllAccounts();
      if (accounts.length > 0) {
        return { address: accounts[0] };
      }
      return null;
    }

    return { address: currentAddress };
  },

  /**
   * Set current active account
   * @param address - Address to set as current
   */
  setCurrentAccount(address: string): void {
    keyringService.setCurrentAddress(address);
  },

  // ============ Lock / Unlock ============

  /**
   * Unlock wallet with password
   * @param password - User password
   * @returns Unlock result
   */
  async unlockWallet(password: string) {
    return lockService.unlockWallet(password);
  },

  /**
   * Unlock wallet with biometrics
   * @returns Unlock result
   */
  async unlockWithBiometrics() {
    return lockService.unlockWithBiometrics();
  },

  /**
   * Lock wallet
   */
  lockWallet(): void {
    lockService.lockWallet();
  },

  /**
   * Check if wallet is locked
   * @returns True if locked
   */
  isLocked(): boolean {
    return lockService.isLocked();
  },

  // ============ Biometric Authentication ============

  /**
   * Enable biometric authentication
   * @param password - User password to verify and store
   * @returns Success status
   */
  async enableBiometrics(password: string): Promise<boolean> {
    return lockService.enableBiometrics(password);
  },

  /**
   * Disable biometric authentication
   * @returns Success status
   */
  async disableBiometrics(): Promise<boolean> {
    return lockService.disableBiometrics();
  },

  /**
   * Get supported biometry type
   * @returns Biometry type or null
   */
  async getSupportedBiometryType() {
    return secureKeychain.getSupportedBiometryType();
  },

  /**
   * Check if biometrics are enabled
   * @returns True if enabled
   */
  isBiometricsEnabled(): boolean {
    return secureKeychain.isAuthenticatedByBiometrics();
  },

  /**
   * Check if biometrics are available
   * @returns True if available on device
   */
  async isBiometricsAvailable(): Promise<boolean> {
    return secureKeychain.isBiometricsAvailable();
  },

  // ============ Export / Backup ============

  /**
   * Export mnemonic phrase
   * WARNING: Only call when user explicitly requests
   * @param keyringIndex - Index of keyring to export (default 0)
   * @returns Mnemonic string
   */
  async exportMnemonic(keyringIndex: number = 0): Promise<string> {
    if (!keyringService.isUnlocked()) {
      throw new Error('Wallet is locked');
    }

    return keyringService.exportMnemonic(keyringIndex);
  },

  /**
   * Export private key for an account
   * WARNING: Only call when user explicitly requests
   * @param address - Account address
   * @returns Private key string
   */
  async exportPrivateKey(address: string): Promise<string> {
    if (!keyringService.isUnlocked()) {
      throw new Error('Wallet is locked');
    }

    return keyringService.exportPrivateKey(address);
  },

  // ============ Password Management ============

  /**
   * Update wallet password
   * @param oldPassword - Current password
   * @param newPassword - New password
   */
  async updatePassword(
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    await keyringService.updatePassword(oldPassword, newPassword);
    console.log('✅ Password updated successfully');
  },

  // ============ Wallet Reset ============

  /**
   * Reset wallet (clear all data)
   * WARNING: This will delete all wallet data!
   */
  resetWallet(): void {
    keyringService.clearAll();
    lockService.lockWallet();
    console.log('🗑️ Wallet reset - all data cleared');
  },

  // ============ Utility ============

  /**
   * Get account info by address
   * @param address - Account address
   * @returns Account info or null
   */
  getAccountByAddress(address: string) {
    return keyringService.getAccountByAddress(address);
  },

  /**
   * Get failed unlock attempts
   * @returns Number of failed attempts
   */
  getFailedAttempts(): number {
    return lockService.getFailedAttempts();
  },

  /**
   * Get lockout remaining time
   * @returns Remaining time in ms
   */
  getLockoutRemainingTime(): number {
    return lockService.getLockoutRemainingTime();
  },
};

/**
 * Legacy export for backward compatibility
 */
export default apisWallet;
