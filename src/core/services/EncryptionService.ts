import { Buffer } from 'buffer';
import Aes from 'react-native-aes-crypto';

/**
 * Encryption Service - Password-based encryption for sensitive data
 * Based on Rabby's encryption pattern using react-native-aes-crypto
 */
export class EncryptionService {
  // Derive key from password using PBKDF2
  public async deriveKey(
    password: string,
    salt: Buffer,
    iterations: number = 5000,
  ): Promise<Buffer> {
    const saltBase64 = salt.toString('base64');
    const keyBase64 = await Aes.pbkdf2(password, saltBase64, iterations, 256, 'sha256');
    return Buffer.from(keyBase64, 'base64');
  }

  // Generate random bytes
  public generateRandomBytes(size: number): Buffer {
    // This function should be async but keeping it sync for compatibility
    // In a real implementation, you would use a proper async random generator
    const buffer = Buffer.alloc(size);
    for (let i = 0; i < size; i++) {
      buffer[i] = Math.floor(Math.random() * 256);
    }
    return buffer;
  }

  // Encrypt data with password
  async encrypt(password: string, data: any): Promise<string> {
    try {
      // Generate salt and IV using react-native-aes-crypto
      const salt = await Aes.randomKey(32);
      const iv = await Aes.randomKey(16);

      // Derive key from password
      const key = await Aes.pbkdf2(password, salt, 5000, 256, 'sha256');

      // Convert data to string
      const jsonData = JSON.stringify(data);

      // Encrypt using react-native-aes-crypto
      const cipher = await Aes.encrypt(jsonData, key, iv, 'aes-256-cbc');

      // Combine salt, iv, and encrypted data in the same format as Rabby
      const result = {
        cipher,
        iv,
        salt,
      };

      return JSON.stringify(result);
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  // Decrypt data with password
  async decrypt(password: string, encryptedData: string): Promise<any> {
    try {
      // Parse encrypted data
      const encrypted = JSON.parse(encryptedData);

      // Get salt and IV
      const salt = encrypted.salt;
      const iv = encrypted.iv;

      console.time('🔐 Decrypt - PBKDF2 key derivation');
      // Derive key from password
      const key = await Aes.pbkdf2(password, salt, 5000, 256, 'sha256');
      console.timeEnd('🔐 Decrypt - PBKDF2 key derivation');

      console.log('🔐 Decrypt - Key derived, attempting decryption...');
      console.log('🔐 Decrypt - IV length:', iv.length);
      console.log('🔐 Decrypt - Cipher length:', encrypted.cipher.length);

      console.time('🔐 Decrypt - AES decryption');
      // Decrypt using react-native-aes-crypto
      const decrypted = await Aes.decrypt(encrypted.cipher, key, iv, 'aes-256-cbc');
      console.timeEnd('🔐 Decrypt - AES decryption');

      console.log('🔐 Decrypt - Decryption successful, parsing JSON...');
      console.log('🔐 Decrypt - Decrypted length:', decrypted.length);

      // Parse and return data
      return JSON.parse(decrypted);
    } catch (error) {
      // Only log error if not pre-warming (password is empty for pre-warm)
      if (password !== '') {
        console.error('🔐 Decrypt - Decryption failed:', error);
        console.error(
          '🔐 Decrypt - Error type:',
          error instanceof Error ? error.constructor.name : typeof error,
        );
        console.error(
          '🔐 Decrypt - Error message:',
          error instanceof Error ? error.message : String(error),
        );
      }
      throw new Error('Failed to decrypt data - invalid password');
    }
  }
}

export const encryptionService = new EncryptionService();
