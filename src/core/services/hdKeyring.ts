import { Wallet } from 'ethers';
import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';
import { HDKey } from '@scure/bip32';

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
  return bip39.generateMnemonic(wordlist, strength);
};

export const validateMnemonic = (mnemonic: string): boolean => {
  return bip39.validateMnemonic(mnemonic, wordlist);
};

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
    return this.wallets.map(w => w.address);
  }

  /**
   * Get a wallet instance by address
   * @param address - Account address
   * @returns Wallet instance or undefined
   */
  getWalletByAddress(address: string): Wallet | undefined {
    return this.wallets.find(
      w => w.address.toLowerCase() === address.toLowerCase(),
    );
  }

  getAccountByAddress(
    address: string,
  ): { address: string; privateKey: string } | null {
    const wallet = this.getWalletByAddress(address);
    return wallet
      ? { address: wallet.address, privateKey: wallet.privateKey }
      : null;
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
