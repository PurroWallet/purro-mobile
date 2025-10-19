import { keyringService, lockService, passwordService, walletService } from '../services';

/**
 * Wallet API - Legacy API interface for compatibility with existing code
 * Wraps the new wallet service with a simpler interface
 */
export class WalletAPI {
  /**
   * Check if wallet exists
   */
  hasWallet(): boolean {
    return walletService.hasWallet();
  }

  /**
   * Check if wallet is locked
   */
  isLocked(): boolean {
    return lockService.isLocked();
  }

  /**
   * Unlock wallet with password
   */
  async unlock(password: string): Promise<boolean> {
    try {
      // First unlock password vault
      const passwordUnlocked = await passwordService.unlockPasswordVault(password);

      if (!passwordUnlocked) {
        return false;
      }

      // Then unlock wallet
      return await walletService.unlockWallet(password);
    } catch (error) {
      console.error('Failed to unlock wallet:', error);
      return false;
    }
  }

  /**
   * Unlock wallet (alias for unlock)
   */
  async unlockWallet(password: string): Promise<boolean> {
    return await this.unlock(password);
  }

  /**
   * Lock wallet
   */
  lock(): void {
    walletService.lockWallet();
    passwordService.lockPasswordVault();
  }

  /**
   * Lock wallet (alias for lock)
   */
  lockWallet(): void {
    this.lock();
  }

  /**
   * Create password vault
   */
  async createPasswordVault(password: string): Promise<void> {
    await passwordService.createPasswordVault(password);
  }

  /**
   * Get all accounts
   */
  async getAllAccounts(): Promise<any[]> {
    return await walletService.getAllAccounts();
  }

  /**
   * Get current account
   */
  async getCurrentAccount(): Promise<any | null> {
    return await walletService.getCurrentAccount();
  }

  /**
   * Set current account
   */
  setCurrentAccount(address: string): void {
    walletService.setCurrentAccount(address);
    lockService.setCurrentAddress(address);
  }

  /**
   * Add new account
   */
  async addNewAccount(): Promise<string> {
    return await walletService.addNewAccount();
  }

  /**
   * Remove account
   */
  async removeAccount(address: string): Promise<void> {
    await walletService.removeAccount(address);
  }

  /**
   * Sign transaction
   */
  async signTransaction(address: string, transaction: any): Promise<any> {
    return await walletService.signTransaction(address, transaction);
  }

  /**
   * Sign message
   */
  async signMessage(address: string, message: any): Promise<string> {
    return await walletService.signMessage(address, message);
  }

  /**
   * Sign typed data
   */
  async signTypedData(address: string, typedData: any): Promise<string> {
    return await walletService.signTypedData(address, typedData);
  }

  /**
   * Export account
   */
  async exportAccount(address: string): Promise<string> {
    return await walletService.exportAccount(address);
  }

  /**
   * Export mnemonic
   */
  async exportMnemonic(): Promise<string> {
    return await walletService.exportMnemonic();
  }

  /**
   * Generate mnemonic
   */
  generateMnemonic(strength?: number): string {
    return keyringService.generateMnemonic(strength);
  }

  /**
   * Import wallet with mnemonic
   */
  async importWallet(mnemonic: string, password: string): Promise<string[]> {
    return await walletService.importWalletWithMnemonic(mnemonic, password);
  }

  /**
   * Import private key
   */
  async importPrivateKey(privateKey: string): Promise<string[]> {
    return await walletService.importWalletWithPrivateKey(privateKey);
  }

  /**
   * Reset wallet
   */
  resetWallet(): void {
    walletService.resetWallet();
  }
}

// Create and export instance
export const apisWallet = new WalletAPI();
