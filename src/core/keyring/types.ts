// Keyring types and interfaces
// Based on Rabby's architecture but optimized for mobile

export enum KEYRING_TYPE {
  HD = 'HD',
  Simple = 'Simple',
  Watch = 'Watch',
}

export enum KEYRING_CLASS {
  MNEMONIC = 'MNEMONIC',
  PRIVATE_KEY = 'PRIVATE_KEY',
  WATCH = 'WATCH',
}

export interface KeyringData<T = any> {
  type: string;
  data: T;
}

export interface Account {
  address: string;
  type: string;
  brandName: string;
  aliasName?: string;
  index?: number;
  balance?: string;
}

// Base interface for all keyrings
export interface IKeyring<TData = any> {
  // Core properties
  readonly type: string;

  // Serialization
  serialize(): Promise<TData>;
  deserialize(data: TData): Promise<void>;

  // Account management
  getAccounts(): Promise<string[]>;
  addAccounts(count: number): Promise<string[]>;
  removeAccount(address: string): Promise<void>;

  // Signing operations
  signTransaction(address: string, transaction: any): Promise<any>;
  signMessage(address: string, message: any): Promise<string>;
  signTypedData(address: string, typedData: any): Promise<string>;

  // Export (when explicitly requested)
  exportAccount(address: string): Promise<string>;

  // Cleanup
  destroy?(): Promise<void>;
}

// HD Keyring data structure
export interface HDKeyringData {
  mnemonic: string;
  passphrase?: string;
  numberOfAccounts: number;
  activeIndexes: number[];
}

// Simple Keyring data structure
export interface SimpleKeyringData {
  privateKeys: string[];
}

// Watch Keyring data structure
export interface WatchKeyringData {
  addresses: string[];
}
