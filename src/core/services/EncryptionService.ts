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
    salt: string,
    iterations: number = 100000, // MetaMask security standard
  ): Promise<string> {
    return await Aes.pbkdf2(password, salt, iterations, 256, 'sha256');
  }

  // Generate random bytes
  public generateRandomBytes(size: number): Buffer {
    const bytes = new Uint8Array(size);
    crypto.getRandomValues(bytes);
    return Buffer.from(bytes);
  }

  // Encrypt data with password
  async encrypt(password: string, data: any): Promise<string> {
    try {
      // Generate salt and IV using react-native-aes-crypto
      const salt = await Aes.randomKey(32);
      const iv = await Aes.randomKey(16);

      // Derive key from password
      const key = await this.deriveKey(password, salt);

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

      // Derive key from password
      const key = await this.deriveKey(password, salt);

      // Decrypt using react-native-aes-crypto
      const decrypted = await Aes.decrypt(encrypted.cipher, key, iv, 'aes-256-cbc');

      // Parse and return data
      const result = JSON.parse(decrypted);
      return result;
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      throw new Error('Failed to decrypt data');
    }
  }
}

export const encryptionService = new EncryptionService();
