import { HDKey } from '@scure/bip32';
import * as bip39 from 'bip39';
import { Buffer } from 'buffer';
import { Wallet } from 'ethers';

// Polyfill Buffer for bip39 in React Native
global.Buffer = global.Buffer || Buffer;

export interface HDKeyringOptions {
  mnemonic?: string;
  passphrase?: string;
  numberOfAccounts?: number;
}

export interface HDKeyringData {
  mnemonic: string;
  passphrase: string;
  numberOfAccounts: number;
}

// Static utility functions
export const generateMnemonic = (strength: number = 128): string => {
  return bip39.generateMnemonic(strength);
};

export const validateMnemonic = (mnemonic: string): boolean => {
  // Check if this is a private key import
  if (mnemonic.startsWith('PRIVATE_KEY:')) {
    const [, privateKey, address] = mnemonic.split(':');
    // Validate private key format (64 hex characters)
    return (
      /^[a-fA-F0-9]{64}$/.test(privateKey) &&
      // Validate address format (42 hex characters starting with 0x)
      /^0x[a-fA-F0-9]{40}$/.test(address)
    );
  }

  return bip39.validateMnemonic(mnemonic);
};

// SimpleKeyring class for private key imports
export class SimpleKeyring {
  private wallets: Wallet[] = [];

  constructor() {}

  addPrivateKey(privateKey: string): void {
    // Remove 0x prefix if present
    const key = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;

    // Validate private key format (64 hex characters)
    if (!/^[a-fA-F0-9]{64}$/.test(key)) {
      throw new Error('Invalid private key format');
    }

    const wallet = new Wallet('0x' + key);
    this.wallets.push(wallet);
  }

  getAccounts(): string[] {
    return this.wallets.map((w) => w.address);
  }

  serialize(): string[] {
    return this.wallets.map((w) => w.privateKey);
  }

  deserialize(data: string[]): void {
    this.wallets = data.map((privateKey) => new Wallet(privateKey));
  }

  exportAccount(address: string): string {
    const wallet = this.wallets.find((w) => w.address.toLowerCase() === address.toLowerCase());
    if (!wallet) {
      throw new Error('Account not found');
    }
    return wallet.privateKey;
  }
}

export class HDKeyring {
  private mnemonic: string;
  private passphrase: string;
  private wallets: Wallet[] = [];
  private hdKey: HDKey;

  constructor(options: HDKeyringOptions = {}) {
    this.mnemonic = options.mnemonic || generateMnemonic();
    this.passphrase = options.passphrase || '';

    // Use @scure/bip32 instead of ethers HDNode for better performance
    const seed = bip39.mnemonicToSeedSync(this.mnemonic, this.passphrase);
    this.hdKey = HDKey.fromMasterSeed(seed);

    if (options.numberOfAccounts) {
      this.addAccounts(options.numberOfAccounts);
    }
  }

  /**
   * BIP44 path: m/44'/60'/0'/0/index (Ethereum)
   * @param index - Account index
   * @returns HD derivation path
   */
  private getPathForIndex(index: number): string {
    return `m/44'/60'/0'/0/${index}`;
  }

  /**
   * Add new accounts to the keyring
   * @param count - Number of accounts to add
   * @returns Array of new account addresses
   */
  addAccounts(count: number = 1): string[] {
    const newWallets: string[] = [];
    const currentLength = this.wallets.length;

    for (let i = 0; i < count; i++) {
      const index = currentLength + i;
      const path = this.getPathForIndex(index);
      const childKey = this.hdKey.derive(path);

      if (!childKey.privateKey) {
        throw new Error('Failed to derive private key');
      }

      const wallet = new Wallet(childKey.privateKey);
      this.wallets.push(wallet);
      newWallets.push(wallet.address);
    }

    return newWallets;
  }

  /**
   * Get all account addresses
   * @returns Array of account addresses
   */
  getAccounts(): string[] {
    return this.wallets.map((w) => w.address);
  }

  /**
   * Get a wallet instance by address
   * @param address - Account address
   * @returns Wallet instance or undefined
   */
  getWalletByAddress(address: string): Wallet | undefined {
    return this.wallets.find((w) => w.address.toLowerCase() === address.toLowerCase());
  }

  getAccountByAddress(address: string): { address: string; privateKey: string } | null {
    const wallet = this.getWalletByAddress(address);
    return wallet ? { address: wallet.address, privateKey: wallet.privateKey } : null;
  }

  /**
   * Export private key for an account
   * @param address - Account address
   * @returns Private key hex string
   */
  exportAccount(address: string): string {
    const wallet = this.getWalletByAddress(address);
    if (!wallet) {
      throw new Error('Account not found');
    }
    return wallet.privateKey;
  }

  /**
   * Get the mnemonic phrase
   * @returns BIP39 mnemonic
   */
  getMnemonic(): string {
    return this.mnemonic;
  }

  /**
   * Serialize keyring data for storage
   * @returns Serialized keyring data
   */
  serialize(): HDKeyringData {
    return {
      mnemonic: this.mnemonic,
      passphrase: this.passphrase,
      numberOfAccounts: this.wallets.length,
    };
  }

  /**
   * Check if mnemonic is valid
   * @returns True if mnemonic is valid
   */
  isValid(): boolean {
    return validateMnemonic(this.mnemonic);
  }

  /**
   * Get number of accounts
   * @returns Number of accounts
   */
  getAccountCount(): number {
    return this.wallets.length;
  }
}
