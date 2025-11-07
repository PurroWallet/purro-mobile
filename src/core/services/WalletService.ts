import { generateMnemonic } from '../keyring';
import { KEYRING_CLASS, KEYRING_TYPE } from '../keyring/types';
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
   * Create new wallet with password - Optimized with parallel operations
   */
  async createWallet(password: string): Promise<{
    mnemonic: string;
    addresses: string[];
  }> {
    try {
      // Boot keyring service for new wallet creation (no vault verification)
      await this.keyringService.bootForNewWallet(password);
      // Generate mnemonic and prepare alias in parallel
      const [mnemonic, alias] = await Promise.all([
        Promise.resolve(generateMnemonic()),
        Promise.resolve(this.generateAliasName(KEYRING_CLASS.MNEMONIC, 0, 0)),
      ]);

      // Create HD keyring with mnemonic
      const addresses = await this.keyringService.createHDKeyring(mnemonic);

      // Store contact with alias
      this.contactBookService.addContact({
        address: addresses[0],
        name: alias,
        isAlias: true,
        brandName: KEYRING_CLASS.MNEMONIC,
      });

      return { mnemonic, addresses };
    } catch (error) {
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

      // Get total account count BEFORE creating the new one for proper naming
      const allAccountsBefore = await this.getAllAccounts();
      const nextAccountNumber = allAccountsBefore.length + 1;
      console.log(
        '📥 importWalletWithMnemonic: Current accounts:',
        allAccountsBefore.length,
        'Next will be Account',
        nextAccountNumber,
      );

      // Create HD keyring with mnemonic
      const addresses = await this.keyringService.createHDKeyring(mnemonic, passphrase);

      // Generate proper account name based on global sequential numbering
      const alias = `Account ${nextAccountNumber}`;

      this.contactBookService.addContact({
        address: addresses[0],
        name: alias,
        isAlias: true,
        brandName: KEYRING_CLASS.MNEMONIC,
      });

      console.log('✅ importWalletWithMnemonic: Created account with alias:', alias);
      return addresses;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Import wallet with private key
   */
  async importWalletWithPrivateKey(privateKey: string): Promise<string[]> {
    try {
      // Get total account count BEFORE creating the new one for proper naming
      const allAccountsBefore = await this.getAllAccounts();
      const nextAccountNumber = allAccountsBefore.length + 1;
      console.log(
        '🔑 importWalletWithPrivateKey: Current accounts:',
        allAccountsBefore.length,
        'Next will be Account',
        nextAccountNumber,
      );

      // Create simple keyring with private key
      const addresses = await this.keyringService.createSimpleKeyring(privateKey);

      // Generate proper account name based on global sequential numbering (not just index 0)
      const alias = `Account ${nextAccountNumber}`;

      // Store contact with alias
      this.contactBookService.addContact({
        address: addresses[0],
        name: alias,
        isAlias: true,
        brandName: KEYRING_CLASS.PRIVATE_KEY,
      });

      console.log('✅ importWalletWithPrivateKey: Created account with alias:', alias);
      return addresses;
    } catch (error) {
      console.error('Failed to import wallet with private key:', error);
      throw error;
    }
  }

  /**
   * Unlock wallet with password - Rabby-style
   */
  async unlockWallet(password: string): Promise<boolean> {
    try {
      await this.keyringService.boot(password);
      await this.keyringService.submitPassword(password);
      this.lockService.markAsUnlocked();

      return true;
    } catch (error) {
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
      const keyringAccounts = await this.keyringService.getAllAccounts();

      const accounts = [];

      for (const account of keyringAccounts) {
        const contact = this.contactBookService.getContactByAddress(account.address);
        accounts.push({
          address: account.address,
          type: account.type,
          brandName: account.brandName,
          aliasName: contact?.name || account.aliasName, // Use stored alias first
        });
      }

      return accounts;
    } catch (error) {
      console.error('Failed to get accounts:', error);
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
        aliasName: contact?.name,
        brandName: contact?.brandName,
      };
    } catch (error) {
      console.error('Failed to get current account:', error);
      return null;
    }
  }

  /**
   * Add new account to specific keyring based on current account
   */
  async addNewAccount(currentAccountAddress?: string): Promise<string> {
    try {
      console.log('📝 WalletService: Adding new account...');
      console.log('📍 Current account address:', currentAccountAddress?.substring(0, 10) + '...');

      // Get total account count BEFORE adding the new one for proper naming
      const allAccountsBefore = await this.getAllAccounts();
      const nextAccountNumber = allAccountsBefore.length + 1;
      console.log(
        '📝 addNewAccount: Current accounts:',
        allAccountsBefore.length,
        'Next will be Account',
        nextAccountNumber,
      );

      let addresses: string[];
      let keyring: any;

      if (currentAccountAddress) {
        // Find the keyring containing the current account and add to it
        console.log('🔍 Finding keyring for current account...');
        keyring = await this.keyringService.getKeyringForAddress(currentAccountAddress);
        console.log('✅ Found keyring type:', keyring.type);

        if (keyring.type !== 'HD') {
          throw new Error('Current account is not from an HD wallet - cannot add more accounts');
        }

        console.log('➕ Adding account to the same keyring as current account...');
        addresses = await keyring.addAccounts(1);
        console.log('✅ Account added to correct keyring');

        // IMPORTANT: Update the KeyringService cache since we bypassed its addAccounts method
        await this.keyringService.refreshAccountsCache();
      } else {
        // Fallback: Add to first HD keyring if no current account specified
        console.log('⚠️ No current account specified, using first HD keyring...');
        addresses = await this.keyringService.addAccounts(1);
        // Get the keyring that was used to add the account
        const hdKeyrings = this.keyringService.getKeyringsByType(KEYRING_TYPE.HD);
        keyring = hdKeyrings.length > 0 ? hdKeyrings[0] : null;
        console.log('✅ Account added to first HD keyring (fallback)');
      }

      // Generate proper account name based on global sequential numbering
      const alias = `Account ${nextAccountNumber}`;

      // Store contact with alias
      this.contactBookService.addContact({
        address: addresses[0],
        name: alias,
        isAlias: true,
        brandName: KEYRING_CLASS.MNEMONIC,
      });

      console.log(
        '✅ Account created successfully with alias:',
        alias,
        addresses[0].substring(0, 10) + '...',
      );
      return addresses[0];
    } catch (error) {
      console.error('❌ Failed to add new account:', error);
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
   * Export mnemonic for specific account address
   * This ensures the correct mnemonic is shown for the selected account
   */
  async exportMnemonicForAddress(address: string): Promise<string> {
    try {
      console.log(
        '🔐 WalletService: Exporting mnemonic for address:',
        address.substring(0, 10) + '...',
      );

      // Get the keyring that contains this address
      const keyring = await this.keyringService.getKeyringForAddress(address);
      console.log('✅ WalletService: Found keyring type:', keyring.type);

      if (keyring.type !== 'HD') {
        throw new Error('Account is not from an HD wallet (seed phrase)');
      }

      // Export mnemonic from the correct keyring
      const mnemonic = (keyring as any).getMnemonic();
      console.log('✅ WalletService: Mnemonic exported successfully');

      return mnemonic;
    } catch (error) {
      console.error('❌ Failed to export mnemonic for address:', error);
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
    // All wallets should use "Account {index}" naming
    return `Account ${addressCount + 1}`;
  }
}

// Create and export instance
export const walletService = new WalletService();
