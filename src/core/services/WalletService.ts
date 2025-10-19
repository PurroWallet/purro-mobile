import { KEYRING_CLASS } from '../keyring/types';
import { ContactBookService } from './ContactBookService';
import { KeyringService } from './KeyringService';
import { LockService } from './LockService';

/**
 * Wallet Service - High-level wallet operations
 * Based on Rabby's wallet service but optimized for mobile
 */
export class WalletService {
  private keyringService: KeyringService;
  private lockService: LockService;
  private contactBookService: ContactBookService;

  constructor(
    keyringService: KeyringService = new KeyringService(),
    lockService: LockService = new LockService(),
    contactBookService: ContactBookService = new ContactBookService(),
  ) {
    this.keyringService = keyringService;
    this.lockService = lockService;
    this.contactBookService = contactBookService;
  }

  /**
   * Check if wallet exists
   */
  hasWallet(): boolean {
    return this.keyringService.hasVault();
  }

  /**
   * Create new wallet with password
   */
  async createWallet(password: string): Promise<{
    mnemonic: string;
    addresses: string[];
  }> {
    try {
      // Boot keyring service with password
      await this.keyringService.boot(password);

      // Generate mnemonic
      const mnemonic = this.keyringService.generateMnemonic();

      // Create HD keyring with mnemonic
      const addresses = await this.keyringService.createHDKeyring(mnemonic);

      // Generate alias for first account
      const alias = this.generateAliasName(KEYRING_CLASS.MNEMONIC, 0, 0);

      // Store contact with alias
      await this.contactBookService.addContact({
        address: addresses[0],
        name: alias,
        isAlias: true,
        brandName: KEYRING_CLASS.MNEMONIC,
      });

      return { mnemonic, addresses };
    } catch (error) {
      console.error('Failed to create wallet:', error);
      throw error;
    }
  }

  /**
   * Import wallet with mnemonic
   */
  async importWalletWithMnemonic(
    mnemonic: string,
    password: string,
    passphrase?: string,
  ): Promise<string[]> {
    try {
      // Boot keyring service with password
      await this.keyringService.boot(password);

      // Create HD keyring with mnemonic
      const addresses = await this.keyringService.createHDKeyring(mnemonic, passphrase);

      // Generate alias for first account
      const alias = this.generateAliasName(KEYRING_CLASS.MNEMONIC, 0, 0);

      // Store contact with alias
      await this.contactBookService.addContact({
        address: addresses[0],
        name: alias,
        isAlias: true,
        brandName: KEYRING_CLASS.MNEMONIC,
      });

      return addresses;
    } catch (error) {
      console.error('Failed to import wallet with mnemonic:', error);
      throw error;
    }
  }

  /**
   * Import wallet with private key
   */
  async importWalletWithPrivateKey(privateKey: string): Promise<string[]> {
    try {
      // Create simple keyring with private key
      const addresses = await this.keyringService.createSimpleKeyring(privateKey);

      // Generate alias for first account
      const alias = this.generateAliasName(KEYRING_CLASS.PRIVATE_KEY, 0, 0);

      // Store contact with alias
      await this.contactBookService.addContact({
        address: addresses[0],
        name: alias,
        isAlias: true,
        brandName: KEYRING_CLASS.PRIVATE_KEY,
      });

      return addresses;
    } catch (error) {
      console.error('Failed to import wallet with private key:', error);
      throw error;
    }
  }

  /**
   * Unlock wallet with password
   */
  async unlockWallet(password: string): Promise<boolean> {
    try {
      console.log('🔓 WalletService.unlockWallet - Starting unlock...');
      await this.keyringService.boot(password);
      console.log('🔓 WalletService.unlockWallet - Keyring booted');

      this.lockService.markAsUnlocked();
      console.log('🔓 WalletService.unlockWallet - Marked as unlocked');

      // Check if we have accounts
      const accounts = await this.getAllAccounts();
      console.log(
        '🔓 WalletService.unlockWallet - Accounts after unlock:',
        JSON.stringify(accounts, null, 2),
      );

      return true;
    } catch (error) {
      console.error('🔓 WalletService.unlockWallet - Failed to unlock wallet:', error);
      return false;
    }
  }

  /**
   * Lock wallet
   */
  async lockWallet(): Promise<void> {
    await this.keyringService.lock();
    this.lockService.lockWallet();
  }

  /**
   * Check if wallet is locked
   */
  isLocked(): boolean {
    return this.lockService.isLocked();
  }

  /**
   * Get all accounts
   */
  async getAllAccounts(): Promise<any[]> {
    try {
      console.log('💼 WalletService.getAllAccounts - Getting accounts from keyring...');
      const keyringAccounts = await this.keyringService.getAllAccounts();
      console.log(
        '💼 WalletService.getAllAccounts - Keyring accounts:',
        JSON.stringify(keyringAccounts, null, 2),
      );

      const accounts = [];

      for (const account of keyringAccounts) {
        const contact = this.contactBookService.getContactByAddress(account.address);
        accounts.push({
          address: account.address,
          type: account.type,
          brandName: account.brandName,
          alianName: contact?.name,
        });
      }

      console.log(
        '💼 WalletService.getAllAccounts - Final accounts:',
        JSON.stringify(accounts, null, 2),
      );
      return accounts;
    } catch (error) {
      console.error('💼 WalletService.getAllAccounts - Error:', error);
      return [];
    }
  }

  /**
   * Get current account
   */
  async getCurrentAccount(): Promise<any | null> {
    try {
      const currentAddress = this.lockService.getCurrentAddress();
      if (!currentAddress) {
        const allAccounts = await this.getAllAccounts();
        if (allAccounts.length > 0) {
          this.lockService.setCurrentAddress(allAccounts[0].address);
          return allAccounts[0];
        }
        return null;
      }

      const contact = this.contactBookService.getContactByAddress(currentAddress);
      return {
        address: currentAddress,
        alianName: contact?.name,
        brandName: contact?.brandName,
      };
    } catch (error) {
      console.error('Failed to get current account:', error);
      return null;
    }
  }

  /**
   * Set current account
   */
  setCurrentAccount(address: string): void {
    this.lockService.setCurrentAddress(address);
  }

  /**
   * Add new account
   */
  async addNewAccount(): Promise<string> {
    try {
      // Add account to HD keyring
      const addresses = await this.keyringService.addAccounts(1);

      // Generate alias for new account
      const allAccounts = await this.getAllAccounts();
      const alias = this.generateAliasName(KEYRING_CLASS.MNEMONIC, 0, allAccounts.length - 1);

      // Store contact with alias
      await this.contactBookService.addContact({
        address: addresses[0],
        name: alias,
        isAlias: true,
        brandName: KEYRING_CLASS.MNEMONIC,
      });

      return addresses[0];
    } catch (error) {
      console.error('Failed to add new account:', error);
      throw error;
    }
  }

  /**
   * Remove account
   */
  async removeAccount(address: string): Promise<void> {
    try {
      await this.keyringService.removeAccount(address);
      this.contactBookService.removeContactByAddress(address);
    } catch (error) {
      console.error('Failed to remove account:', error);
      throw error;
    }
  }

  /**
   * Sign transaction
   */
  async signTransaction(address: string, transaction: any): Promise<any> {
    try {
      return await this.keyringService.signTransaction(address, transaction);
    } catch (error) {
      console.error('Failed to sign transaction:', error);
      throw error;
    }
  }

  /**
   * Sign message
   */
  async signMessage(address: string, message: any): Promise<string> {
    try {
      return await this.keyringService.signMessage(address, message);
    } catch (error) {
      console.error('Failed to sign message:', error);
      throw error;
    }
  }

  /**
   * Sign typed data
   */
  async signTypedData(address: string, typedData: any): Promise<string> {
    try {
      return await this.keyringService.signTypedData(address, typedData);
    } catch (error) {
      console.error('Failed to sign typed data:', error);
      throw error;
    }
  }

  /**
   * Export account
   */
  async exportAccount(address: string): Promise<string> {
    try {
      return await this.keyringService.exportAccount(address);
    } catch (error) {
      console.error('Failed to export account:', error);
      throw error;
    }
  }

  /**
   * Export mnemonic
   */
  async exportMnemonic(): Promise<string> {
    try {
      return await this.keyringService.exportMnemonic();
    } catch (error) {
      console.error('Failed to export mnemonic:', error);
      throw error;
    }
  }

  /**
   * Reset wallet
   */
  resetWallet(): void {
    this.keyringService.clearAll();
    this.lockService.lockWallet();
    this.contactBookService.clearAll();
  }

  /**
   * Generate alias name
   */
  generateAliasName(brandName: string, keyringCount: number, addressCount: number): string {
    if (brandName === KEYRING_CLASS.MNEMONIC) {
      return `Account ${addressCount + 1}`;
    } else if (brandName === KEYRING_CLASS.PRIVATE_KEY) {
      return `Private Key ${keyringCount + 1}`;
    } else {
      return `${brandName} ${addressCount + 1}`;
    }
  }
}

// Create and export instance
export const walletService = new WalletService();
