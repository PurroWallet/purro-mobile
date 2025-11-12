import { EventEmitter } from 'events';
import {
  Account,
  createKeyring,
  generateMnemonic,
  IKeyring,
  KEYRING_CLASS,
  KEYRING_TYPE,
  KeyringData,
  validateMnemonic,
} from '../keyring';
import { keyringStorage, walletStorage } from '../storage/secureStorage';
import { encryptionService } from './EncryptionService';

/**
 * Keyring Service - Main service for managing HD wallets
 * Following Rabby's architecture but optimized for mobile with MMKV storage
 */
export class KeyringService extends EventEmitter {
  private keyrings: IKeyring[] = [];
  private cachedAccounts: Account[] = [];
  private password: string | null = null;
  private booted: boolean = false;
  private unlocked: boolean = false;

  constructor() {
    super();
  }

  // Load account addresses from fast storage (no decryption needed)
  private async loadAccountAddresses(): Promise<void> {
    try {
      const storedAccounts = walletStorage.getItem<Account[]>('account_addresses');
      if (storedAccounts) {
        this.cachedAccounts = storedAccounts;
      }
    } catch (error) {
      // Handle error silently
    }
  }

  // Save account addresses to fast storage
  private async saveAccountAddresses(): Promise<void> {
    try {
      walletStorage.setItem('account_addresses', this.cachedAccounts);
    } catch (error) {
      // Handle error silently
    }
  }

  private async _performBoot(password: string, verifyPassword: boolean): Promise<void> {
    console.log('🔧 _performBoot called with verifyPassword:', verifyPassword);
    console.log('🔧 Current state:', {
      booted: this.booted,
      unlocked: this.unlocked,
      hasPassword: !!this.password,
    });

    if (this.booted && this.unlocked && this.password === password) {
      console.log('🔧 Already booted with same password, returning');
      return;
    }

    console.log('🔧 Setting password...');
    this.password = password;
    console.log('✅ Password set');

    if (verifyPassword) {
      console.log('🔧 Verifying password...');
      await this.verifyPassword(password);
      console.log('✅ Password verified');
    }

    console.log('🔧 Loading account addresses...');
    await this.loadAccountAddresses();
    console.log('✅ Account addresses loaded');

    this.unlocked = true;
    this.booted = true;
    console.log('✅ Boot complete:', { booted: this.booted, unlocked: this.unlocked });
  }

  async boot(password: string): Promise<void> {
    console.log('🔑 KeyringService: Booting with password verification...');
    const result = await this._performBoot(password, true);
    console.log('✅ KeyringService: Boot complete');
    return result;
  }

  async bootForNewWallet(password: string): Promise<void> {
    console.log('🔑 KeyringService: Booting for new wallet (no verification)...');
    const result = await this._performBoot(password, false);
    console.log('✅ KeyringService: Boot for new wallet complete');
    return result;
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

  // Create new HD keyring with mnemonic
  async createHDKeyring(mnemonic: string, passphrase?: string): Promise<string[]> {
    console.log('📝 KeyringService: Creating HD keyring with mnemonic...');
    if (!this.booted) {
      console.error('❌ Keyring service not booted');
      throw new Error('Keyring service not booted');
    }

    if (!validateMnemonic(mnemonic)) {
      console.error('❌ Invalid mnemonic phrase');
      throw new Error('Invalid mnemonic phrase');
    }

    // Check for duplicate mnemonic before creating new keyring
    await this.checkForDuplicateMnemonic(mnemonic);

    const keyring = createKeyring(KEYRING_TYPE.HD, {
      mnemonic,
      passphrase,
      numberOfAccounts: 1,
    }) as any;

    await this.addKeyring(keyring);
    const accounts = keyring.getAccounts();
    console.log('✅ KeyringService: HD keyring created, accounts:', accounts);

    return accounts;
  }

  // Create new Simple keyring with private key
  async createSimpleKeyring(privateKey: string): Promise<string[]> {
    console.log('🔐 KeyringService: Creating simple keyring with private key...');
    if (!this.booted) {
      console.error('❌ Keyring service not booted');
      throw new Error('Keyring service not booted');
    }

    const keyring = createKeyring(KEYRING_TYPE.Simple, {
      privateKey,
    });

    await this.addKeyring(keyring);
    const accounts = keyring.getAccounts();
    console.log('✅ KeyringService: Simple keyring created, accounts:', accounts);

    return accounts;
  }

  // Add keyring to the service
  async addKeyring(keyring: IKeyring): Promise<void> {
    // Check for duplicate accounts
    const accounts = await keyring.getAccounts();
    await this.checkForDuplicateAccounts(keyring.type, accounts);

    this.keyrings.push(keyring);
    await this.persistKeyrings();

    // Update cached accounts
    for (const address of accounts) {
      this.cachedAccounts.push({
        address,
        type: keyring.type,
        brandName: this.getBrandName(keyring.type),
      });
    }
    await this.saveAccountAddresses();

    this.emit('keyringAdded', { type: keyring.type, accounts });
  }

  // Get all accounts from cache (fast) or keyrings (slow, when needed)
  async getAllAccounts(): Promise<Account[]> {
    // Return cached accounts if available (fast path)
    if (this.cachedAccounts.length > 0) {
      return this.cachedAccounts;
    }

    // Load from keyrings if no cache (slow path, should rarely happen)
    if (this.keyrings.length === 0) {
      await this.loadKeyrings(this.password!);
    }

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

    this.cachedAccounts = allAccounts;
    await this.saveAccountAddresses();
    return allAccounts;
  }

  // Refresh accounts cache - call this after adding accounts directly to keyrings
  async refreshAccountsCache(): Promise<void> {
    console.log('🔄 Refreshing accounts cache...');

    // Clear cache to force reload from keyrings
    this.cachedAccounts = [];

    // Reload from keyrings
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

    this.cachedAccounts = allAccounts;
    await this.saveAccountAddresses();
    console.log(`✅ Cache refreshed with ${allAccounts.length} accounts`);
  }

  // Get keyring for a specific address (loads keyrings on-demand if needed)
  async getKeyringForAddress(address: string): Promise<IKeyring> {
    const normalizedAddress = address.toLowerCase();

    // If keyrings not loaded, load them now (for sensitive operations like export)
    if (this.keyrings.length === 0 && this.password) {
      await this.loadKeyrings(this.password);
    }

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
    // If keyrings not loaded, load them now
    if (this.keyrings.length === 0 && this.password) {
      await this.loadKeyrings(this.password);
    }

    if (keyringIndex >= this.keyrings.length) {
      throw new Error('Keyring not found');
    }

    const keyring = this.keyrings[keyringIndex];
    if (keyring.type !== KEYRING_TYPE.HD) {
      throw new Error('Not an HD keyring');
    }

    return (keyring as any).getMnemonic();
  }

  // Get all HD keyrings with their accounts for seed phrase management
  async getHDKeyringsWithAccounts(): Promise<
    Array<{
      id: string;
      accountCount: number;
      accounts: Array<{ address: string; index: number }>;
      keyring: IKeyring;
    }>
  > {
    // If keyrings not loaded, load them now
    if (this.keyrings.length === 0 && this.password) {
      await this.loadKeyrings(this.password);
    }

    const hdKeyrings = this.getKeyringsByType(KEYRING_TYPE.HD);

    const result = [];
    for (let i = 0; i < hdKeyrings.length; i++) {
      const keyring = hdKeyrings[i];
      const accounts = await keyring.getAccounts();

      result.push({
        id: `seed_${i + 1}`,
        accountCount: accounts.length,
        accounts: accounts.map((address: string, accountIndex: number) => ({
          address,
          index: accountIndex,
        })),
        keyring,
      });
    }

    return result;
  }

  // Export mnemonic for specific HD keyring by index
  async exportMnemonicForHDKeyring(keyringIndex: number): Promise<string> {
    // If keyrings not loaded, load them now
    if (this.keyrings.length === 0 && this.password) {
      await this.loadKeyrings(this.password);
    }

    const hdKeyrings = this.getKeyringsByType(KEYRING_TYPE.HD);

    if (keyringIndex >= hdKeyrings.length) {
      throw new Error(`HD keyring index ${keyringIndex} not found`);
    }

    const keyring = hdKeyrings[keyringIndex];
    if (keyring.type !== KEYRING_TYPE.HD) {
      throw new Error('Not an HD keyring');
    }

    return (keyring as any).getMnemonic();
  }

  // Add new account to the first HD keyring
  async addAccounts(count: number = 1): Promise<string[]> {
    // If keyrings not loaded, load them now
    if (this.keyrings.length === 0 && this.password) {
      await this.loadKeyrings(this.password);
    }

    const hdKeyrings = this.getKeyringsByType(KEYRING_TYPE.HD);

    if (hdKeyrings.length === 0) {
      throw new Error('No HD keyring available');
    }

    const hdKeyring = hdKeyrings[0];
    const addresses = await hdKeyring.addAccounts(count);

    // Persist keyrings
    await this.persistKeyrings();

    // Update cached accounts
    for (const address of addresses) {
      this.cachedAccounts.push({
        address,
        type: hdKeyring.type,
        brandName: this.getBrandName(hdKeyring.type),
      });
    }
    await this.saveAccountAddresses();

    return addresses;
  }

  // Remove account
  async removeAccount(address: string): Promise<void> {
    const keyring = await this.getKeyringForAddress(address);
    await keyring.removeAccount(address);

    // Update cached accounts
    this.cachedAccounts = this.cachedAccounts.filter((account) => account.address !== address);
    await this.saveAccountAddresses();

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
    console.log('💾 KeyringService: Saving keyrings to encrypted storage...');
    console.log('🔑 Password available:', !!this.password);
    console.log('📊 Keyrings to save:', serializedKeyrings);
    const encrypted = await encryptionService.encrypt(this.password, serializedKeyrings);
    keyringStorage.setItem('vault', encrypted);
    console.log('✅ KeyringService: Keyrings saved successfully');
  }

  // Load keyrings from encrypted storage
  private async loadKeyrings(password: string): Promise<void> {
    const encryptedVault = keyringStorage.getItem<string>('vault');

    if (!encryptedVault) {
      return;
    }

    const decrypted = await encryptionService.decrypt(password, encryptedVault);

    this.keyrings = [];
    for (const keyringData of decrypted) {
      const keyring = createKeyring(keyringData.type);
      await keyring.deserialize(keyringData.data);
      this.keyrings.push(keyring);
    }
  }

  // Verify password against stored vault
  public async verifyPassword(password: string): Promise<void> {
    const encryptedVault = keyringStorage.getItem<string>('vault');

    if (!encryptedVault) {
      throw new Error('No vault found');
    }

    try {
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
    // If already unlocked via boot(), don't verify again
    if (this.unlocked && this.keyrings.length > 0) {
      return;
    }

    await this.verifyPassword(password);

    // If keyrings not loaded (shouldn't happen with new flow), load them
    if (this.keyrings.length === 0) {
      await this.loadKeyrings(password);
      this.password = password;
    }

    this.unlocked = true;
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

  // Check for duplicate mnemonics to prevent multiple keyrings with same seed phrase
  private async checkForDuplicateMnemonic(newMnemonic: string): Promise<void> {
    console.log('🔍 Checking for duplicate mnemonic...');

    for (const keyring of this.keyrings) {
      if (keyring.type === KEYRING_TYPE.HD) {
        try {
          const existingMnemonic = (keyring as any).getMnemonic();
          if (existingMnemonic === newMnemonic) {
            console.log('❌ Duplicate mnemonic detected');
            throw new Error('This seed phrase is already imported');
          }
        } catch (error) {
          // Keyring might be locked or inaccessible, skip
          console.log('⚠️ Could not access mnemonic for duplicate check');
        }
      }
    }

    console.log('✅ No duplicate mnemonic found');
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
    this.keyrings = []; // Clear keyrings to free memory

    this.emit('locked');
  }

  // Clear all data (dangerous!)
  clearAll(): void {
    this.keyrings = [];
    this.cachedAccounts = [];
    this.unlocked = false;
    this.password = null;
    this.booted = false;
    keyringStorage.removeItem('vault');
    walletStorage.removeItem('account_addresses');
    this.emit('cleared');
  }

  // Check if vault exists
  hasVault(): boolean {
    const vault = keyringStorage.getItem<string>('vault');
    return !!vault;
  }
}

export const keyringService = new KeyringService();
