import { HDKey } from '@scure/bip32';
import * as bip39 from '@scure/bip39';
import { mnemonicToSeedWebcrypto } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';
import { Wallet } from 'ethers';
import { AbstractKeyring } from './AbstractKeyring';
import { HDKeyringData, KEYRING_CLASS, KEYRING_TYPE } from './types';

/**
 * HD Keyring implementation for mnemonic-based wallets
 * Supports BIP39 mnemonic and BIP44 derivation paths
 */
export class HDKeyring extends AbstractKeyring<HDKeyringData> {
  readonly type = KEYRING_TYPE.HD;

  private mnemonic: string = '';
  private passphrase: string = '';
  private hdPath: string = "m/44'/60'/0'/0";
  private addresses: string[] = [];
  private hdKey!: HDKey;

  constructor(
    options: {
      mnemonic?: string;
      passphrase?: string;
      numberOfAccounts?: number;
      skipGeneration?: boolean; // Flag for deserialization - don't generate mnemonic
    } = {},
  ) {
    super();

    // Skip generation for deserialization - deserialize() will set everything
    if (options.skipGeneration) {
      return;
    }

    if (options.mnemonic) {
      this.mnemonic = options.mnemonic;
      this.passphrase = options.passphrase || '';
      // Note: Cannot await in constructor - caller must await initialize()

      // Note: Cannot add accounts in constructor - need to call initialize() first
      // This will be handled by the caller after initialization
    } else {
      // Generate new mnemonic if not provided
      this.mnemonic = bip39.generateMnemonic(wordlist, 128); // 128 bits = 12 words
      this.passphrase = '';
      // Note: Cannot await in constructor - caller must await initialize()
      // Note: Cannot add accounts in constructor - need to call initialize() first
      // This will be handled by the caller after initialization
    }
  }

  /**
   * Initialize the keyring from mnemonic
   * MUST be called after construction when mnemonic is provided
   */
  async initialize(): Promise<void> {
    await this.initializeFromMnemonic();
  }

  private async initializeFromMnemonic(): Promise<void> {
    const totalStartTime = performance.now();
    console.log('        🌱 [HDKeyring.initializeFromMnemonic] START');

    // Step 1: Validate mnemonic
    const validateStartTime = performance.now();
    const isValid = bip39.validateMnemonic(this.mnemonic, wordlist);
    console.log(
      `        ⏱️  [HDKeyring.initializeFromMnemonic] Validate mnemonic took ${(performance.now() - validateStartTime).toFixed(2)}ms`,
    );

    if (!isValid) {
      throw new Error('Invalid mnemonic');
    }

    // Step 2: Convert mnemonic to seed using NATIVE crypto (5-10x faster than pure JS)
    const seedStartTime = performance.now();
    console.log(
      '        🚀 [HDKeyring.initializeFromMnemonic] Starting mnemonicToSeedWebcrypto (NATIVE CRYPTO - FAST!)...',
    );
    const seed = await mnemonicToSeedWebcrypto(this.mnemonic, this.passphrase);
    const seedEndTime = performance.now();
    console.log(
      `        ⏱️  [HDKeyring.initializeFromMnemonic] mnemonicToSeedWebcrypto took ${(seedEndTime - seedStartTime).toFixed(2)}ms`,
    );

    // Step 3: Derive master key from seed
    const masterKeyStartTime = performance.now();
    console.log('        🔑 [HDKeyring.initializeFromMnemonic] Creating HDKey from master seed...');
    this.hdKey = HDKey.fromMasterSeed(seed);
    const masterKeyEndTime = performance.now();
    console.log(
      `        ⏱️  [HDKeyring.initializeFromMnemonic] HDKey.fromMasterSeed took ${(masterKeyEndTime - masterKeyStartTime).toFixed(2)}ms`,
    );

    const totalTime = performance.now() - totalStartTime;
    console.log(
      `        ✅ [HDKeyring.initializeFromMnemonic] COMPLETE in ${totalTime.toFixed(2)}ms`,
    );
  }

  async serialize(): Promise<HDKeyringData> {
    return {
      mnemonic: this.mnemonic,
      passphrase: this.passphrase,
      hdPath: "m/44'/60'/0'/0",
      addresses: this.addresses,
    };
  }

  async deserialize(data: HDKeyringData): Promise<void> {
    this.mnemonic = data.mnemonic;
    this.passphrase = data.passphrase || '';
    this.hdPath = data.hdPath;
    this.addresses = data.addresses;

    // CRITICAL: Initialize hdKey so signing/export operations work
    await this.initializeFromMnemonic();

    console.log(`✅ HDKeyring: Loaded ${this.addresses.length} addresses`);
  }

  async getAccounts(): Promise<string[]> {
    return this.addresses;
  }

  protected async generateAccounts(count: number): Promise<string[]> {
    const newAddresses: string[] = [];
    const currentLength = this.addresses.length;

    for (let i = 0; i < count; i++) {
      const index = currentLength + i;
      const address = this.addAccountAtIndex(index);
      newAddresses.push(address);
    }

    return newAddresses;
  }

  private addAccountAtIndex(index: number): string {
    if (!this.hdKey) {
      throw new Error('HD key not initialized - call initialize() first');
    }

    const path = `${this.hdPath}/${index}`;
    const childKey = this.hdKey.derive(path);

    if (!childKey.privateKey) {
      throw new Error('Failed to derive private key');
    }

    const wallet = new Wallet(childKey.privateKey);
    const address = wallet.address;

    // Store address
    this.addresses[index] = address;

    return address;
  }

  /**
   * Helper method to derive wallet from address
   * Eliminates code duplication across signing methods
   */
  private deriveWalletForAddress(address: string): Wallet {
    if (!this.hdKey) {
      throw new Error('HD key not initialized - call initialize() first');
    }

    const index = this.addresses.indexOf(address);
    if (index < 0) {
      throw new Error('Unknown address');
    }

    const path = `${this.hdPath}/${index}`;
    const childKey = this.hdKey.derive(path);

    if (!childKey.privateKey) {
      throw new Error('Failed to derive private key');
    }

    return new Wallet(childKey.privateKey);
  }

  async removeAccount(address: string): Promise<void> {
    const index = this.addresses.indexOf(address);

    if (index === -1) {
      throw new Error('Account not found');
    }

    this.addresses.splice(index, 1);
  }

  async signTransaction(address: string, transaction: any): Promise<any> {
    const wallet = this.deriveWalletForAddress(address);
    return wallet.signTransaction(transaction);
  }

  async signMessage(address: string, message: any): Promise<string> {
    const wallet = this.deriveWalletForAddress(address);
    return wallet.signMessage(message);
  }

  async signTypedData(address: string, typedData: any): Promise<string> {
    const wallet = this.deriveWalletForAddress(address);
    return (wallet as any)._signTypedData(typedData.domain, typedData.types, typedData.value);
  }

  async exportAccount(address: string): Promise<string> {
    const startTime = performance.now();
    console.log('      🔐 [HDKeyring.exportAccount] START - Deriving wallet for address');
    const wallet = this.deriveWalletForAddress(address);
    const endTime = performance.now();
    console.log(
      `      ⏱️  [HDKeyring.exportAccount] Derive wallet took ${(endTime - startTime).toFixed(2)}ms`,
    );
    console.log(
      `      ✅ [HDKeyring.exportAccount] COMPLETE in ${(endTime - startTime).toFixed(2)}ms`,
    );
    return wallet.privateKey;
  }

  protected async getWalletByAddress(address: string): Promise<any> {
    const index = this.addresses.indexOf(address);
    if (index < 0) {
      return undefined;
    }

    return this.deriveWalletForAddress(address);
  }

  // Additional methods specific to HD keyring
  getMnemonic(): string {
    return this.mnemonic;
  }

  getBrandName(): string {
    return KEYRING_CLASS.MNEMONIC;
  }

  // Override destroy to clear sensitive data
  async destroy(): Promise<void> {
    this.mnemonic = '';
    this.passphrase = '';
    this.addresses = [];
    // @ts-ignore
    this.hdKey = null;
  }
}
