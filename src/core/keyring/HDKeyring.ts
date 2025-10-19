import { HDKey } from '@scure/bip32';
import * as bip39 from 'bip39';
import { Buffer } from 'buffer';
import { Wallet } from 'ethers';
import { AbstractKeyring } from './AbstractKeyring';
import { HDKeyringData, KEYRING_CLASS, KEYRING_TYPE } from './types';

// Polyfill Buffer for bip39 in React Native
global.Buffer = global.Buffer || Buffer;

/**
 * HD Keyring implementation for mnemonic-based wallets
 * Supports BIP39 mnemonic and BIP44 derivation paths
 */
export class HDKeyring extends AbstractKeyring<HDKeyringData> {
  readonly type = KEYRING_TYPE.HD;

  private mnemonic: string = '';
  private passphrase: string = '';
  private wallets: Wallet[] = [];
  private hdKey!: HDKey;

  constructor(options: { mnemonic?: string; passphrase?: string; numberOfAccounts?: number } = {}) {
    super();

    if (options.mnemonic) {
      this.mnemonic = options.mnemonic;
      this.passphrase = options.passphrase || '';
      this.initializeFromMnemonic();

      if (options.numberOfAccounts) {
        this.addAccounts(options.numberOfAccounts);
      }
    } else {
      // Generate new mnemonic if not provided
      this.mnemonic = bip39.generateMnemonic();
      this.passphrase = '';
      this.initializeFromMnemonic();

      // Create first account by default
      this.addAccounts(1);
    }
  }

  private initializeFromMnemonic(): void {
    const seed = bip39.mnemonicToSeedSync(this.mnemonic, this.passphrase);
    this.hdKey = HDKey.fromMasterSeed(seed);
  }

  async serialize(): Promise<HDKeyringData> {
    return {
      mnemonic: this.mnemonic,
      passphrase: this.passphrase,
      numberOfAccounts: this.wallets.length,
      activeIndexes: this.wallets.map((_, index) => index),
    };
  }

  async deserialize(data: HDKeyringData): Promise<void> {
    this.mnemonic = data.mnemonic;
    this.passphrase = data.passphrase || '';
    this.initializeFromMnemonic();

    // Restore accounts
    this.wallets = [];
    for (let i = 0; i < data.numberOfAccounts; i++) {
      await this.addAccountAtIndex(i);
    }
  }

  async getAccounts(): Promise<string[]> {
    return this.wallets.map((w) => w.address);
  }

  protected async generateAccounts(count: number): Promise<string[]> {
    const newWallets: string[] = [];
    const currentLength = this.wallets.length;

    for (let i = 0; i < count; i++) {
      const index = currentLength + i;
      const address = await this.addAccountAtIndex(index);
      newWallets.push(address);
    }

    return newWallets;
  }

  private async addAccountAtIndex(index: number): Promise<string> {
    const path = this.getPathForIndex(index);
    const childKey = this.hdKey.derive(path);

    if (!childKey.privateKey) {
      throw new Error('Failed to derive private key');
    }

    const wallet = new Wallet(childKey.privateKey);
    this.wallets.push(wallet);
    return wallet.address;
  }

  private getPathForIndex(index: number): string {
    // BIP44 standard derivation path for Ethereum
    return `m/44'/60'/0'/0/${index}`;
  }

  async removeAccount(address: string): Promise<void> {
    const index = this.wallets.findIndex((w) => w.address.toLowerCase() === address.toLowerCase());

    if (index === -1) {
      throw new Error('Account not found');
    }

    this.wallets.splice(index, 1);
  }

  async signTransaction(address: string, transaction: any): Promise<any> {
    const wallet = this.getWalletByAddress(address);
    if (!wallet) {
      throw new Error('Account not found');
    }

    return wallet.signTransaction(transaction);
  }

  async signMessage(address: string, message: any): Promise<string> {
    const wallet = this.getWalletByAddress(address);
    if (!wallet) {
      throw new Error('Account not found');
    }

    return wallet.signMessage(message);
  }

  async signTypedData(address: string, typedData: any): Promise<string> {
    const wallet = this.getWalletByAddress(address);
    if (!wallet) {
      throw new Error('Account not found');
    }

    // Use _signTypedData which is the internal method in ethers v6
    return (wallet as any)._signTypedData(typedData.domain, typedData.types, typedData.value);
  }

  async exportAccount(address: string): Promise<string> {
    const wallet = this.getWalletByAddress(address);
    if (!wallet) {
      throw new Error('Account not found');
    }

    return wallet.privateKey;
  }

  private getWalletByAddress(address: string): Wallet | undefined {
    return this.wallets.find((w) => w.address.toLowerCase() === address.toLowerCase());
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
    this.wallets = [];
    // @ts-ignore
    this.hdKey = null;
  }
}
