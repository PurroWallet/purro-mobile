import { contactBookService, lockService, walletService } from '../services';

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
    return walletService.bootForNewWallet(password);
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
    return walletService.importWalletWithMnemonic(mnemonic, password);
  }

  /**
   * Import wallet from private key
   */
  async importWalletWithPrivateKey(privateKey: string): Promise<string[]> {
    return walletService.importWalletWithPrivateKey(privateKey);
  }

  /**
   * Import wallet with mnemonic (for new wallet creation - no vault verification)
   */
  async importWalletWithMnemonicNew(
    mnemonic: string,
    password: string,
    passphrase?: string,
  ): Promise<string[]> {
    return walletService.importWalletWithMnemonicNew(mnemonic, password, passphrase);
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
   * Set current account
   */
  setCurrentAccount(address: string): void {
    walletService.setCurrentAccount(address);
  }

  /**
   * Add new account
   */
  async addNewAccount(): Promise<string> {
    return walletService.addNewAccount();
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
   * Remove contact
   */
  removeContact(address: string): boolean {
    return contactBookService.removeContact(address);
  }
}

export const walletController = new WalletController();
