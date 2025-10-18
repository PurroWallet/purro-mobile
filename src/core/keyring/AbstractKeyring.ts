import { IKeyring } from './types';

/**
 * Abstract base class for all keyrings
 * Implements common functionality and template method pattern
 */
export abstract class AbstractKeyring<TData = any> implements IKeyring<TData> {
  abstract readonly type: string;
  
  // Common validation logic
  protected validateAddress(address: string): boolean {
    // Simple validation for Ethereum addresses
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
  
  protected async checkDuplicate(_address: string): Promise<void> {
    // This will be implemented in KeyringService
    // to check for duplicate addresses across all keyrings
    // Parameter prefixed with _ to indicate it's intentionally unused
  }
  
  // Template method pattern for adding accounts
  async addAccounts(count: number): Promise<string[]> {
    const addresses = await this.generateAccounts(count);
    
    // Validate each address
    for (const address of addresses) {
      if (!this.validateAddress(address)) {
        throw new Error(`Invalid address: ${address}`);
      }
      await this.checkDuplicate(address);
    }
    
    return addresses;
  }
  
  // Abstract methods to be implemented by concrete classes
  abstract serialize(): Promise<TData>;
  abstract deserialize(data: TData): Promise<void>;
  abstract getAccounts(): Promise<string[]>;
  abstract removeAccount(address: string): Promise<void>;
  abstract signTransaction(address: string, transaction: any): Promise<any>;
  abstract signMessage(address: string, message: any): Promise<string>;
  abstract signTypedData(address: string, typedData: any): Promise<string>;
  abstract exportAccount(address: string): Promise<string>;
  
  // Protected method to be implemented by concrete classes
  protected abstract generateAccounts(count: number): Promise<string[]>;
  
  // Common cleanup method
  async destroy(): Promise<void> {
    // Default implementation does nothing
    // Concrete classes can override if needed
  }
}