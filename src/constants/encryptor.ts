/**
 * Encryptor constants
 * Default password and encryption settings
 */

/**
 * Generate a random salt for encryption
 */
export function generateSalt(): string {
  const array = new Uint8Array(32);
  for (let i = 0; i < array.length; i++) {
    array[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Encryption algorithm settings
 */
export const ENCRYPTION_CONFIG = {
  algorithm: 'aes-256-gcm',
  keyLength: 32,
  ivLength: 16,
  saltLength: 32,
} as const;
