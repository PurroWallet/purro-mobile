import { IKeyring } from './types';

/**
 * Abstract base class for all keyrings
 */
export abstract class AbstractKeyring<TData = any> implements IKeyring<TData> {
  abstract readonly type: string;

  protected validateAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  async addAccounts(count: number): Promise<string[]> {
    const addresses = await this.generateAccounts(count);

    for (const address of addresses) {
      if (!this.validateAddress(address)) {
        throw new Error(`Invalid address: ${address}`);
      }
    }

    return addresses;
  }

  protected async _signWithWallet<T = any>(
    address: string,
    operation: (wallet: any) => T,
  ): Promise<T> {
    const wallet = await this.getWalletByAddress(address);
    if (!wallet) {
      throw new Error('Account not found');
    }
    return operation(wallet);
  }

  abstract serialize(): Promise<TData>;
  abstract deserialize(data: TData): Promise<void>;
  abstract getAccounts(): Promise<string[]>;
  abstract removeAccount(address: string): Promise<void>;
  abstract signTransaction(address: string, transaction: any): Promise<any>;
  abstract signMessage(address: string, message: any): Promise<string>;
  abstract signTypedData(address: string, typedData: any): Promise<string>;
  abstract exportAccount(address: string): Promise<string>;

  protected abstract generateAccounts(count: number): Promise<string[]>;
  protected abstract getWalletByAddress(address: string): Promise<any>;

  async destroy(): Promise<void> {
    // Default implementation does nothing
  }
}
