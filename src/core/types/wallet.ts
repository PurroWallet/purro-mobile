export interface Account {
  address: string;
  name: string;
  brandName: string;
}

export interface CreateWalletResult {
  mnemonic: string;
  account: Account;
}

export interface UnlockResult {
  success: boolean;
  error?: string;
}
