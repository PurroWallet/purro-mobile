import { EventEmitter } from 'events';
import {
  Account,
  createKeyring,
  IKeyring,
  KEYRING_CLASS,
  KEYRING_TYPE,
  KeyringData,
  validateMnemonic,
} from '../keyring';
import { keyringStorage } from '../storage/secureStorage';

/**
 * Keyring Service - Main service for managing HD wallets
 * Following Rabby's architecture but optimized for mobile with MMKV storage
 */
export class KeyringService extends EventEmitter {
  private keyrings: IKeyring[] = [];
  private password: string | null = null;
  private booted: boolean = false;
  private unlocked: boolean = false;

  constructor() {
    super();
  }

  // Boot the service with password
  async boot(password: string): Promise<void> {
    console.log('🚀 KeyringService.boot - Starting...', {
      booted: this.booted,
      unlocked: this.unlocked,
      keyringsCount: this.keyrings.length,
      passwordMatch: this.password === password,
    });

    if (this.booted) {
      console.log('🚀 KeyringService.boot - Already booted');

      // If keyrings not loaded yet (from pre-warming), load them now
      if (this.keyrings.length === 0) {
        console.log('🚀 KeyringService.boot - No keyrings loaded, loading now...');
        try {
          await this.loadKeyrings(password);
          this.password = password;
          this.unlocked = true;
          console.log('🚀 KeyringService.boot - Keyrings loaded, unlocked');
          return;
        } catch (error) {
          console.error('🚀 KeyringService.boot - Failed to load keyrings:', error);
          throw error;
        }
      }

      if (this.password === password) {
        this.unlocked = true;
        console.log('🚀 KeyringService.boot - Password matches, unlocking');
        return;
      }

      await this.verifyPassword(password);
      this.unlocked = true;
      console.log('🚀 KeyringService.boot - Password verified, unlocked');
      return;
    }

    this.password = password;
    console.log('🚀 KeyringService.boot - First boot, loading keyrings...');

    try {
      await this.loadKeyrings(password);
      this.unlocked = true;
      this.booted = true;
      console.log('🚀 KeyringService.boot - Keyrings loaded successfully');
    } catch (error) {
      console.error('🚀 KeyringService.boot - Error loading keyrings:', error);
      // DON'T mark as booted on failure - let next unlock try full boot
      this.keyrings = [];
      this.unlocked = false;
      this.password = '';
      console.log('🚀 KeyringService.boot - Failed, not marking as booted');
      throw error;
    }

    console.log('🚀 KeyringService.boot - Boot complete!', {
      keyringsCount: this.keyrings.length,
      unlocked: this.unlocked,
    });
  }

  // Check if keyring is booted
  isBooted(): boolean {
    return this.booted;
  }

  // Check if keyring is unlocked
  isUnlocked(): boolean {
    return this.unlocked;
  }

  // Get current password (only when unlocked)
  getPassword(): string | null {
    if (!this.unlocked) {
      return null;
    }
    return this.password;
  }

  // Generate new mnemonic phrase
  generateMnemonic(strength: number = 128): string {
    const { generateMnemonic } = require('../keyring');
    return generateMnemonic(strength);
  }

  // Create new HD keyring with mnemonic
  async createHDKeyring(mnemonic: string, passphrase?: string): Promise<string[]> {
    if (!this.booted) {
      throw new Error('Keyring service not booted');
    }

    if (!validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic phrase');
    }

    const keyring = createKeyring(KEYRING_TYPE.HD, {
      mnemonic,
      passphrase,
      numberOfAccounts: 1,
    }) as any;

    await this.addKeyring(keyring);

    return keyring.getAccounts();
  }

  // Create new Simple keyring with private key
  async createSimpleKeyring(privateKey: string): Promise<string[]> {
    if (!this.booted) {
      throw new Error('Keyring service not booted');
    }

    const keyring = createKeyring(KEYRING_TYPE.Simple, {
      privateKey,
    });

    await this.addKeyring(keyring);

    return keyring.getAccounts();
  }

  // Add keyring to the service
  async addKeyring(keyring: IKeyring): Promise<void> {
    // Check for duplicate accounts
    const accounts = await keyring.getAccounts();
    await this.checkForDuplicateAccounts(keyring.type, accounts);

    this.keyrings.push(keyring);
    await this.persistKeyrings();

    this.emit('keyringAdded', { type: keyring.type, accounts });
  }

  // Get all accounts from all keyrings
  async getAllAccounts(): Promise<Account[]> {
    const allAccounts: Account[] = [];

    for (const keyring of this.keyrings) {
      const accounts = await keyring.getAccounts();
      for (const address of accounts) {
        allAccounts.push({
          address,
          type: keyring.type,
          brandName: this.getBrandName(keyring.type),
        });
      }
    }

    return allAccounts;
  }

  // Get keyring for a specific address
  async getKeyringForAddress(address: string): Promise<IKeyring> {
    const normalizedAddress = address.toLowerCase();

    for (const keyring of this.keyrings) {
      const accounts = await keyring.getAccounts();
      if (accounts.some((acc) => acc.toLowerCase() === normalizedAddress)) {
        return keyring;
      }
    }

    throw new Error('No keyring found for the requested account');
  }

  // Get keyrings by type
  getKeyringsByType(type: KEYRING_TYPE): IKeyring[] {
    return this.keyrings.filter((keyring) => keyring.type === type);
  }

  // Sign transaction with address
  async signTransaction(address: string, transaction: any): Promise<any> {
    const keyring = await this.getKeyringForAddress(address);
    return keyring.signTransaction(address, transaction);
  }

  // Sign message with address
  async signMessage(address: string, message: any): Promise<string> {
    const keyring = await this.getKeyringForAddress(address);
    return keyring.signMessage(address, message);
  }

  // Sign typed data with address
  async signTypedData(address: string, typedData: any): Promise<string> {
    const keyring = await this.getKeyringForAddress(address);
    return keyring.signTypedData(address, typedData);
  }

  // Export account (private key or mnemonic)
  async exportAccount(address: string): Promise<string> {
    const keyring = await this.getKeyringForAddress(address);
    return keyring.exportAccount(address);
  }

  // Export mnemonic for HD keyring
  async exportMnemonic(keyringIndex: number = 0): Promise<string> {
    if (keyringIndex >= this.keyrings.length) {
      throw new Error('Keyring not found');
    }

    const keyring = this.keyrings[keyringIndex];
    if (keyring.type !== KEYRING_TYPE.HD) {
      throw new Error('Not an HD keyring');
    }

    return (keyring as any).getMnemonic();
  }

  // Add new account to the first HD keyring
  async addAccounts(count: number = 1): Promise<string[]> {
    const hdKeyrings = this.getKeyringsByType(KEYRING_TYPE.HD);

    if (hdKeyrings.length === 0) {
      throw new Error('No HD keyring available');
    }

    const hdKeyring = hdKeyrings[0];
    const addresses = await hdKeyring.addAccounts(count);

    // Persist keyrings
    await this.persistKeyrings();

    return addresses;
  }

  // Remove account
  async removeAccount(address: string): Promise<void> {
    const keyring = await this.getKeyringForAddress(address);
    await keyring.removeAccount(address);

    // If keyring has no more accounts, remove it
    const accounts = await keyring.getAccounts();
    if (accounts.length === 0) {
      const index = this.keyrings.indexOf(keyring);
      if (index > -1) {
        this.keyrings.splice(index, 1);
      }
    }

    // Persist keyrings
    await this.persistKeyrings();

    this.emit('accountRemoved', { address });
  }

  // Persist all keyrings to encrypted storage
  async persistKeyrings(): Promise<void> {
    if (!this.password) {
      throw new Error('No password set');
    }

    const serializedKeyrings: KeyringData[] = [];

    for (const keyring of this.keyrings) {
      const data = await keyring.serialize();
      serializedKeyrings.push({
        type: keyring.type,
        data,
      });
    }

    // Encrypt and save to MMKV
    const { encryptionService } = require('../services/EncryptionService');
    const encrypted = await encryptionService.encrypt(this.password, serializedKeyrings);

    keyringStorage.setItem('vault', encrypted);
  }

  // Load keyrings from encrypted storage
  private async loadKeyrings(password: string): Promise<void> {
    const encryptedVault = keyringStorage.getItem<string>('vault');

    console.log('🔑 LoadKeyrings - Vault exists:', !!encryptedVault);
    console.log('🔑 LoadKeyrings - Vault type:', typeof encryptedVault);
    if (encryptedVault) {
      console.log('🔑 LoadKeyrings - Vault length:', JSON.stringify(encryptedVault).length);
    }

    if (!encryptedVault) {
      console.log('🔑 LoadKeyrings - No vault found, initializing empty keyrings');
      return;
    }

    const { encryptionService } = require('../services/EncryptionService');
    console.log('🔑 LoadKeyrings - Attempting to decrypt vault...');
    const decrypted = await encryptionService.decrypt(password, encryptedVault);
    console.log('🔑 LoadKeyrings - Decryption successful!');
    console.log('🔑 LoadKeyrings - Decrypted data:', JSON.stringify(decrypted, null, 2));
    console.log('🔑 LoadKeyrings - Decrypted keyrings count:', decrypted.length);

    this.keyrings = [];

    for (const keyringData of decrypted) {
      console.log('🔑 LoadKeyrings - Processing keyring:', JSON.stringify(keyringData, null, 2));
      const keyring = createKeyring(keyringData.type);
      await keyring.deserialize(keyringData.data);
      console.log('🔑 LoadKeyrings - Keyring deserialized, accounts:', await keyring.getAccounts());
      this.keyrings.push(keyring);
    }

    console.log('🔑 LoadKeyrings - Total keyrings loaded:', this.keyrings.length);
  }

  // Verify password against stored vault
  public async verifyPassword(password: string): Promise<void> {
    const encryptedVault = keyringStorage.getItem<string>('vault');

    if (!encryptedVault) {
      throw new Error('No vault found');
    }

    try {
      const { encryptionService } = require('../services/EncryptionService');
      await encryptionService.decrypt(password, encryptedVault);
    } catch {
      throw new Error('Incorrect password');
    }
  }

  // Update password
  public async updatePassword(oldPassword: string, newPassword: string): Promise<void> {
    await this.verifyPassword(oldPassword);
    this.password = newPassword;
    await this.persistKeyrings();
  }

  // Reset password
  public async resetPassword(newPassword: string): Promise<void> {
    this.password = newPassword;
    await this.persistKeyrings();
  }

  // Get count of accounts in keyring
  public async getCountOfAccountsInKeyring(): Promise<number> {
    const allAccounts = await this.getAllAccounts();
    return allAccounts.length;
  }

  // Submit password to unlock
  public async submitPassword(password: string): Promise<void> {
    console.log('🔑 KeyringService.submitPassword - Starting...', {
      keyringsCount: this.keyrings.length,
      unlocked: this.unlocked,
      booted: this.booted,
    });

    // If already unlocked via boot(), don't verify again
    if (this.unlocked && this.keyrings.length > 0) {
      console.log('🔑 KeyringService.submitPassword - Already unlocked, skipping');
      return;
    }

    await this.verifyPassword(password);

    // If keyrings not loaded (shouldn't happen with new flow), load them
    if (this.keyrings.length === 0) {
      console.log('🔑 KeyringService.submitPassword - No keyrings, loading now...');
      await this.loadKeyrings(password);
      this.password = password;
    }

    this.unlocked = true;
    console.log('🔑 KeyringService.submitPassword - Complete!', {
      keyringsCount: this.keyrings.length,
      unlocked: this.unlocked,
    });
  }

  // Dangerously reset password and keyrings
  public async dangerouslyResetPasswordAndKeyrings(
    oldPassword: string,
    newPassword?: string,
  ): Promise<void> {
    await this.verifyPassword(oldPassword);
    this.keyrings = [];
    this.password = newPassword || null;
    if (newPassword) {
      await this.persistKeyrings();
    } else {
      keyringStorage.removeItem('vault');
    }
  }

  // Check for duplicate accounts
  private async checkForDuplicateAccounts(type: string, newAccounts: string[]): Promise<void> {
    const allAccounts: string[] = [];

    for (const keyring of this.keyrings) {
      if (keyring.type === type) {
        const accounts = await keyring.getAccounts();
        allAccounts.push(...accounts);
      }
    }

    for (const newAccount of newAccounts) {
      if (allAccounts.some((acc) => acc.toLowerCase() === newAccount.toLowerCase())) {
        throw new Error(`Account already exists: ${newAccount}`);
      }
    }
  }

  // Get brand name for keyring type
  private getBrandName(type: string): string {
    switch (type) {
      case KEYRING_TYPE.HD:
        return KEYRING_CLASS.MNEMONIC;
      case KEYRING_TYPE.Simple:
        return KEYRING_CLASS.PRIVATE_KEY;
      default:
        return type;
    }
  }

  // Lock the service
  async lock(): Promise<void> {
    this.unlocked = false;
    this.password = null;

    // Destroy all keyrings to clear sensitive data
    for (const keyring of this.keyrings) {
      if (keyring.destroy) {
        await keyring.destroy();
      }
    }

    this.emit('locked');
  }

  // Clear all data (dangerous!)
  clearAll(): void {
    this.keyrings = [];
    this.unlocked = false;
    this.password = null;
    this.booted = false;
    keyringStorage.removeItem('vault');
    this.emit('cleared');
  }

  // Check if vault exists
  hasVault(): boolean {
    const vault = keyringStorage.getItem<string>('vault');
    return !!vault;
  }
}

export const keyringService = new KeyringService();
