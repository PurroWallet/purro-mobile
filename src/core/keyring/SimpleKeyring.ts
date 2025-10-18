import { Wallet } from 'ethers';
import { AbstractKeyring } from './AbstractKeyring';
import { SimpleKeyringData, KEYRING_TYPE, KEYRING_CLASS } from './types';

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
      privateKeys: this.wallets.map(w => w.privateKey),
    };
  }
  
  async deserialize(data: SimpleKeyringData): Promise<void> {
    this.wallets = [];
    for (const privateKey of data.privateKeys) {
      this.addPrivateKey(privateKey);
    }
  }
  
  async getAccounts(): Promise<string[]> {
    return this.wallets.map(w => w.address);
  }
  
  addPrivateKey(privateKey: string): void {
    // Check if this is our special format for private key import
    if (privateKey.startsWith('PRIVATE_KEY:')) {
      // Extract the actual private key from our special format
      // Format: PRIVATE_KEY:{privateKey}:{address}
      const parts = privateKey.split(':');
      if (parts.length >= 2) {
        const key = parts[1];
        
        // Remove 0x prefix if present
        const cleanKey = key.startsWith('0x') ? key.slice(2) : key;
        
        // Validate private key format (64 hex characters)
        if (!/^[a-fA-F0-9]{64}$/.test(cleanKey)) {
          throw new Error('Invalid private key format');
        }
        
        const wallet = new Wallet('0x' + cleanKey);
        this.wallets.push(wallet);
        return;
      }
    }
    
    // Regular private key handling
    // Remove 0x prefix if present
    const key = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
    
    // Validate private key format (64 hex characters)
    if (!/^[a-fA-F0-9]{64}$/.test(key)) {
      throw new Error('Invalid private key format');
    }
    
    const wallet = new Wallet('0x' + key);
    this.wallets.push(wallet);
  }
  
  protected async generateAccounts(_count: number): Promise<string[]> {
    throw new Error('Simple keyring cannot generate accounts. Use addPrivateKey instead.');
  }
  
  async removeAccount(address: string): Promise<void> {
    const index = this.wallets.findIndex(
      w => w.address.toLowerCase() === address.toLowerCase()
    );
    
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
    return this.wallets.find(
      w => w.address.toLowerCase() === address.toLowerCase()
    );
  }
  
  getBrandName(): string {
    return KEYRING_CLASS.PRIVATE_KEY;
  }
  
  // Override destroy to clear sensitive data
  async destroy(): Promise<void> {
    this.wallets = [];
  }
}