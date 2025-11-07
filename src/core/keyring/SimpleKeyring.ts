import { ethers, Wallet } from 'ethers';
import { AbstractKeyring } from './AbstractKeyring';
import { KEYRING_CLASS, KEYRING_TYPE, SimpleKeyringData } from './types';

/**
 * Simple Keyring implementation for private key wallets
 * Manages individual private keys without hierarchical derivation
 */
export class SimpleKeyring extends AbstractKeyring<SimpleKeyringData> {
  readonly type = KEYRING_TYPE.Simple;

  private wallets: Wallet[] = [];

  constructor(privateKey?: string) {
    super();
    if (privateKey) {
      this.addPrivateKey(privateKey);
    }
  }

  async serialize(): Promise<SimpleKeyringData> {
    return {
      privateKeys: this.wallets.map((w) => w.privateKey),
    };
  }

  async deserialize(data: SimpleKeyringData): Promise<void> {
    this.wallets = [];
    for (const privateKey of data.privateKeys) {
      this.addPrivateKey(privateKey);
    }
  }

  async getAccounts(): Promise<string[]> {
    return this.wallets.map((w) => w.address);
  }

  addPrivateKey(privateKey: string): void {
    // Check if this is our special format for private key import
    if (privateKey.startsWith('PRIVATE_KEY:')) {
      // Extract the actual private key from our special format
      // Format: PRIVATE_KEY:{privateKey}:{address}
      const parts = privateKey.split(':');
      if (parts.length >= 2) {
        const key = parts[1];

        // Validate private key using ethers.js
        const cleanKey = key.startsWith('0x') ? key : '0x' + key;

        if (!ethers.utils.isHexString(cleanKey, 32)) {
          throw new Error('Invalid private key format');
        }

        const wallet = new Wallet(cleanKey);
        this.wallets.push(wallet);
        return;
      }
    }

    // Regular private key handling
    // Validate private key using ethers.js
    const key = privateKey.startsWith('0x') ? privateKey : '0x' + privateKey;

    if (!ethers.utils.isHexString(key, 32)) {
      throw new Error('Invalid private key format');
    }

    const wallet = new Wallet(key);
    this.wallets.push(wallet);
  }

  protected async generateAccounts(_count: number): Promise<string[]> {
    throw new Error('Simple keyring cannot generate accounts. Use addPrivateKey instead.');
  }

  async removeAccount(address: string): Promise<void> {
    const index = this.wallets.findIndex((w) => w.address.toLowerCase() === address.toLowerCase());

    if (index === -1) {
      throw new Error('Account not found');
    }

    this.wallets.splice(index, 1);
  }

  async signTransaction(address: string, transaction: any): Promise<any> {
    return this._signWithWallet(address, (wallet) => wallet.signTransaction(transaction));
  }

  async signMessage(address: string, message: any): Promise<string> {
    return this._signWithWallet(address, (wallet) => wallet.signMessage(message));
  }

  async signTypedData(address: string, typedData: any): Promise<string> {
    return this._signWithWallet(address, (wallet) =>
      (wallet as any)._signTypedData(typedData.domain, typedData.types, typedData.value),
    );
  }

  async exportAccount(address: string): Promise<string> {
    return this._signWithWallet(address, (wallet) => wallet.privateKey);
  }

  protected async getWalletByAddress(address: string): Promise<Wallet | undefined> {
    return this.wallets.find((w) => w.address.toLowerCase() === address.toLowerCase());
  }

  getBrandName(): string {
    return KEYRING_CLASS.PRIVATE_KEY;
  }

  // Override destroy to clear sensitive data
  async destroy(): Promise<void> {
    this.wallets = [];
  }
}
