/**
 * Wallet service - Main API for wallet operations
 */

import { Wallet } from 'ethers';
import { MMKV } from 'react-native-mmkv';
import * as bip39 from 'bip39';
import { MMKV_FILE_NAMES } from '../storage';
import { keyringService } from './keyring';

let storage: MMKV | null = null;

const getStorage = () => {
  if (!storage) {
    try {
      storage = new MMKV({
        id: MMKV_FILE_NAMES.WALLET,
      });
    } catch (error) {
      // Silently fail - MMKV requires JSI which doesn't work with remote debugger
      // The wallet will work in memory-only mode
      console.warn(
        '[WalletService] MMKV initialization failed, using memory-only mode',
      );
      return null;
    }
  }
  return storage;
};

export interface WalletAccount {
  address: string;
  balance?: string;
}

// In-memory storage when MMKV is not available (debug mode)
const memoryStorage = new Map<string, string>();

// Storage wrapper that falls back to memory storage if MMKV fails
const storageWrapper = {
  getString: (key: string): string | undefined => {
    const mmkvStorage = getStorage();
    if (mmkvStorage) {
      return mmkvStorage.getString(key);
    }
    // Fallback to memory storage
    return memoryStorage.get(key);
  },
  set: (key: string, value: string | number | boolean): void => {
    const mmkvStorage = getStorage();
    if (mmkvStorage) {
      mmkvStorage.set(key, value);
    } else {
      // Fallback to memory storage
      memoryStorage.set(key, String(value));
    }
  },
  delete: (key: string): void => {
    const mmkvStorage = getStorage();
    if (mmkvStorage) {
      mmkvStorage.delete(key);
    } else {
      memoryStorage.delete(key);
    }
  },
  clearAll: (): void => {
    const mmkvStorage = getStorage();
    if (mmkvStorage) {
      mmkvStorage.clearAll();
    } else {
      memoryStorage.clear();
    }
  },
};

class WalletService {
  /**
   * Check if wallet exists
   */
  hasWallet(): boolean {
    const vault = storageWrapper.getString('vault');
    return !!vault;
  }

  /**
   * Create new wallet
   */
  generateMnemonic(): string {
    return bip39.generateMnemonic();
  }

  createWalletFromMnemonic(mnemonic: string): Wallet {
    return Wallet.fromMnemonic(mnemonic);
  }

  /**
   * Legacy method - kept for compatibility, now returns mnemonic only
   */
  async createWallet(): Promise<{ mnemonic: string }> {
    const mmkvStorage = getStorage();
    if (!mmkvStorage && !memoryStorage.has('_warned')) {
      memoryStorage.set('_warned', 'true');
      console.warn(
        '[WalletService] Running in memory-only mode. Wallet will not persist between app restarts.',
      );
    }

    const mnemonic = this.generateMnemonic();
    return { mnemonic };
  }

  /**
   * Import wallet from mnemonic - Boot keyring first
   */
  async importWallet(mnemonic: string): Promise<{ address: string }> {
    // Boot keyring service with default password first
    if (!keyringService.isBooted()) {
      await keyringService.boot('default_password_temp');
    }

    const addresses = await keyringService.createKeyring(mnemonic);
    return {
      address: addresses[0],
    };
  }

  /**
   * Save wallet with password
   */
  async saveWallet(password: string): Promise<boolean> {
    try {
      await keyringService.persistAllKeyrings(password);
      return true;
    } catch (error) {
      console.error('Failed to save wallet:', error);
      return false;
    }
  }

  /**
   * Get current account
   */
  getCurrentAccount(): WalletAccount | null {
    const accounts = keyringService.getAccounts();
    if (accounts.length === 0) {
      return null;
    }

    return {
      address: accounts[0],
    };
  }

  /**
   * Get all accounts
   */
  getAllAccounts(): WalletAccount[] {
    const accounts = keyringService.getAccounts();
    return accounts.map(address => ({ address }));
  }

  /**
   * Get account balance (placeholder - would connect to blockchain)
   */
  async getAccountBalance(_address: string): Promise<string> {
    // TODO: Implement actual balance fetching from blockchain
    // For now, return a placeholder
    return '0.00';
  }

  /**
   * Get first account address (for compatibility)
   */
  getFirstAccount(): string | null {
    const accounts = keyringService.getAllAccounts();
    return accounts.length > 0 ? accounts[0] : null;
  }

  /**
   * Reset wallet (clear all data)
   */
  resetWallet(): void {
    keyringService.clearAll();
    storageWrapper.clearAll();
  }

  /**
   * Export mnemonic (requires wallet to be unlocked)
   */
  async exportMnemonic(): Promise<string> {
    if (!keyringService.isUnlocked()) {
      throw new Error('Wallet is locked');
    }

    return keyringService.exportMnemonic();
  }

  /**
   * Export private key (requires wallet to be unlocked)
   */
  async exportPrivateKey(address?: string): Promise<string> {
    if (!keyringService.isUnlocked()) {
      throw new Error('Wallet is locked');
    }

    const addr = address || this.getFirstAccount();
    if (!addr) {
      throw new Error('No account available');
    }

    return keyringService.exportPrivateKey(addr);
  }
}

export const apisWallet = new WalletService();
