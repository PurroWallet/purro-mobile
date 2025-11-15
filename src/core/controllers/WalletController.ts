import { KEYRING_TYPE } from '../keyring/types';
import { contactBookService, keyringService, lockService, walletService } from '../services';

/**
 * Wallet Controller - Main controller for wallet operations
 * Provides a high-level API for wallet operations
 */
export class WalletController {
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
    return walletService.unlockWallet(password);
  }

  /**
   * Lock wallet
   */
  async lock(): Promise<void> {
    await walletService.lockWallet();
  }

  /**
   * Boot keyring for new wallet creation (no vault verification)
   */
  async bootForNewWallet(password: string): Promise<void> {
    const result = await keyringService.bootForNewWallet(password);
    return result;
  }

  /**
   * Create new wallet
   */
  async createWallet(password: string): Promise<{ mnemonic: string; addresses: string[] }> {
    return walletService.createWallet(password);
  }

  /**
   * Import wallet with mnemonic
   */
  async importWalletWithMnemonic(mnemonic: string, password: string): Promise<string[]> {
    const result = await walletService.importWalletWithMnemonic(mnemonic, password);
    return result;
  }

  /**
   * Import wallet from private key
   */
  async importWalletWithPrivateKey(privateKey: string): Promise<string[]> {
    const result = await walletService.importWalletWithPrivateKey(privateKey);
    return result;
  }

  /**
   * Get current account
   */
  async getCurrentAccount(): Promise<any | null> {
    return walletService.getCurrentAccount();
  }

  /**
   * Get all accounts
   */
  async getAllAccounts(): Promise<any[]> {
    return walletService.getAllAccounts();
  }

  /**
   * Get all keyrings by type
   */
  async getKeyringsByType(type: KEYRING_TYPE): Promise<any[]> {
    return keyringService.getKeyringsByType(type);
  }

  /**
   * Get all HD keyrings
   */
  async getHDKeyrings(): Promise<any[]> {
    return keyringService.getKeyringsByType(KEYRING_TYPE.HD);
  }

  /**
   * Get all HD keyrings with their accounts for seed phrase management
   */
  async getHDKeyringsWithAccounts(): Promise<
    Array<{
      id: string;
      accountCount: number;
      accounts: Array<{ address: string; index: number }>;
    }>
  > {
    return keyringService.getHDKeyringsWithAccounts();
  }

  /**
   * Set current account
   */
  setCurrentAccount(address: string): void {
    lockService.setCurrentAddress(address);
  }

  /**
   * Add new account to specific keyring based on current account
   */
  async addNewAccount(currentAccountAddress?: string): Promise<string> {
    return walletService.addNewAccount(currentAccountAddress);
  }

  /**
   * Add new account to specific HD keyring by index
   */
  async addAccountToHDKeyring(keyringIndex: number): Promise<string> {
    return walletService.addAccountToHDKeyring(keyringIndex);
  }

  /**
   * Remove account
   */
  async removeAccount(address: string): Promise<void> {
    return walletService.removeAccount(address);
  }

  /**
   * Sign transaction
   */
  async signTransaction(address: string, transaction: any): Promise<any> {
    return walletService.signTransaction(address, transaction);
  }

  /**
   * Sign message
   */
  async signMessage(address: string, message: any): Promise<string> {
    return walletService.signMessage(address, message);
  }

  /**
   * Sign typed data
   */
  async signTypedData(address: string, typedData: any): Promise<string> {
    return walletService.signTypedData(address, typedData);
  }

  /**
   * Export account
   */
  async exportAccount(address: string): Promise<string> {
    return walletService.exportAccount(address);
  }

  /**
   * Export mnemonic
   */
  async exportMnemonic(): Promise<string> {
    return walletService.exportMnemonic();
  }

  /**
   * Export mnemonic for specific account address
   */
  async exportMnemonicForAddress(address: string): Promise<string> {
    return walletService.exportMnemonicForAddress(address);
  }

  /**
   * Export mnemonic for specific HD keyring by index
   */
  async exportMnemonicForHDKeyring(keyringIndex: number): Promise<string> {
    return walletService.exportMnemonicForHDKeyring(keyringIndex);
  }

  /**
   * Reset wallet
   */
  resetWallet(): void {
    walletService.resetWallet();
  }

  /**
   * Get auto lock time
   */
  getAutoLockTime(): number {
    return lockService.getAutoLockTime();
  }

  /**
   * Set auto lock time
   */
  setAutoLockTime(minutes: number): void {
    lockService.setAutoLockTime(minutes);
  }

  /**
   * Check if biometrics is enabled
   */
  isBiometricsEnabled(): boolean {
    return lockService.isBiometricsEnabled();
  }

  /**
   * Enable biometrics
   */
  async enableBiometrics(password: string): Promise<boolean> {
    return lockService.enableBiometrics(password);
  }

  /**
   * Disable biometrics
   */
  async disableBiometrics(): Promise<boolean> {
    return lockService.disableBiometrics();
  }

  /**
   * Get contact by address
   */
  getContactByAddress(address: string): any | null {
    return contactBookService.getContactByAddress(address);
  }

  /**
   * Add contact
   */
  addContact(contact: { address: string; name: string }): void {
    contactBookService.addContact(contact);
  }

  /**
   * Update contact
   */
  updateContact(address: string, updates: { name?: string }): boolean {
    return contactBookService.updateContact(address, updates);
  }

  /**
   * Update account alias (alias for updateContact)
   */
  updateAccountAlias(address: string, alias: string): boolean {
    return contactBookService.updateContact(address, { name: alias });
  }

  /**
   * Generate proper account name based on global sequential numbering
   */
  async generateAccountName(address: string): Promise<string> {
    try {
      // Get all accounts in creation order
      const allAccounts = await this.getAllAccounts();

      // Find the index of this account in the global account list
      const globalIndex = allAccounts.findIndex((acc) => acc.address === address);

      if (globalIndex !== -1) {
        return `Account ${globalIndex + 1}`;
      }

      // Fallback - count accounts and add 1 for new account
      return `Account ${allAccounts.length + 1}`;
    } catch (error) {
      return 'Account 1';
    }
  }

  /**
   * Remove contact
   */
  removeContact(address: string): boolean {
    return contactBookService.removeContact(address);
  }
}

export const walletController = new WalletController();
