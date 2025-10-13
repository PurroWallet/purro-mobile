import { atom } from 'jotai';

/**
 * App global state - Rabby Pattern
 * Using Jotai atoms for cross-component state management
 */

// App initialization
export const appInitialized = atom<boolean>(false);
export const appLoading = atom<boolean>(false);

// Current navigation route
export const currentRoute = atom<string>('Welcome');

// Wallet state
export const walletExists = atom<boolean>(false);
export const walletUnlocked = atom<boolean>(false);

// Terms acceptance
export const termsAccepted = atom<boolean>(false);

// Biometrics
export const biometricsEnabled = atom<boolean>(false);

// Account interface
export interface Account {
  address: string;
  name?: string;
  balance?: string;
}

// Current and all accounts
export const currentAccount = atom<Account | null>(null);
export const allAccounts = atom<Account[]>([]);
