// Import and initialize services

import { ContactBookService } from './ContactBookService';
import { EncryptionService } from './EncryptionService';
import { KeyringService } from './KeyringService';
import { LockService } from './LockService';
import { NetworkProviderService } from './NetworkProviderService';
import { PasswordService } from './PasswordService';
import { TokenService } from './TokenService';
import { TransactionHistoryService } from './TransactionHistoryService';
import { TransactionService } from './TransactionService';
import { WalletService } from './WalletService';

export * from './ContactBookService';
export * from './EncryptionService';
export * from './KeyringService';
export * from './LockService';
export * from './NetworkProviderService';
export * from './PasswordService';
export * from './TokenService';
export * from './TransactionHistoryService';
export * from './TransactionService';
// Export all services
export * from './WalletService';

// Create service instances (ORDER MATTERS!)
export const keyringService = new KeyringService();
export const lockService = new LockService();
export const contactBookService = new ContactBookService();
export const encryptionService = new EncryptionService();
export const passwordService = new PasswordService();

// Network and Token services
export const networkProviderService = new NetworkProviderService();
export const tokenService = new TokenService();
export const transactionHistoryService = new TransactionHistoryService();
export const transactionService = new TransactionService();

// WalletService must use the same keyringService instance
export const walletService = new WalletService(keyringService, lockService, contactBookService);
