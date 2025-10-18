// Import and initialize services
import { WalletService } from './WalletService';
import { KeyringService } from './KeyringService';
import { LockService } from './LockService';
import { ContactBookService } from './ContactBookService';
import { EncryptionService } from './EncryptionService';
import { PasswordService } from './PasswordService';

// Export all services
export * from './WalletService';
export * from './KeyringService';
export * from './LockService';
export * from './ContactBookService';
export * from './EncryptionService';
export * from './PasswordService';

// Create service instances (ORDER MATTERS!)
export const keyringService = new KeyringService();
export const lockService = new LockService();
export const contactBookService = new ContactBookService();
export const encryptionService = new EncryptionService();
export const passwordService = new PasswordService();

// WalletService must use the same keyringService instance
export const walletService = new WalletService(
  keyringService,
  lockService,
  contactBookService,
);
