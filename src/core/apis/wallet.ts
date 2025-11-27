import { keyringService, lockService, walletService } from '../services';

export class WalletAPI {
  hasWallet(): boolean {
    return walletService.hasWallet();
  }

  isLocked(): boolean {
    return lockService.isLocked();
  }

  async unlock(password: string): Promise<boolean> {
    try {
      const walletUnlocked = await walletService.unlockWallet(password);
      return walletUnlocked;
    } catch {
      return false;
    }
  }

  async importWallet(mnemonic: string, password: string): Promise<void> {
    await walletService.importWalletWithMnemonic(mnemonic, password);
  }

  async importPrivateKey(privateKey: string): Promise<void> {
    await walletService.importWalletWithPrivateKey(privateKey);
  }

  async exportMnemonic(): Promise<string> {
    return keyringService.exportMnemonicForHDKeyring(0);
  }

  lockWallet(): void {
    lockService.lockWallet();
  }

  resetWallet(): void {
    walletService.resetWallet();
  }
}

export const apisWallet = new WalletAPI();
