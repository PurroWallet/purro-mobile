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
      console.log('🔐 Deriving key with PBKDF2...');
      const key = await Aes.pbkdf2(password, salt, 5000, 256, 'sha256');
      console.log('🔐 Derived key length:', key.length);

      // Convert data to string
      const jsonData = JSON.stringify(data);
      console.log('🔐 Data to encrypt size:', jsonData.length);

      // Encrypt using react-native-aes-crypto
      console.log('🔐 Encrypting data...');
      const cipher = await Aes.encrypt(jsonData, key, iv, 'aes-256-cbc');
      console.log('🔐 Encrypted cipher length:', cipher.length);

      // Combine salt, iv, and encrypted data in the same format as Rabby
      const result = {
        cipher,
        iv,
        salt,
      };

      console.log('🔐 Encryption successful');
      return JSON.stringify(result);
    } catch (error) {
      console.error('❌ Encryption failed:', error);
      console.error('❌ Error details:', {
        passwordProvided: !!password,
        dataProvided: !!data,
        dataType: typeof data,
      });
      throw new Error('Failed to encrypt data');
    }
  }

  // Decrypt data with password
  async decrypt(password: string, encryptedData: string): Promise<any> {
    try {
      console.log('🔐 EncryptionService.decrypt - Starting decryption...');
      console.log('🔐 Encrypted data size:', encryptedData.length);

      // Parse encrypted data
      const encrypted = JSON.parse(encryptedData);
      console.log('🔐 Parsed encrypted data keys:', Object.keys(encrypted));

      // Get salt and IV
      const salt = encrypted.salt;
      const iv = encrypted.iv;
      console.log('🔐 Salt length:', salt.length, 'IV length:', iv.length);

      // Derive key from password
      console.log('🔐 Deriving key with PBKDF2 for decryption...');
      const key = await Aes.pbkdf2(password, salt, 5000, 256, 'sha256');
      console.log('🔐 Derived key length:', key.length);

      // Decrypt using react-native-aes-crypto
      console.log('🔐 Decrypting cipher...');
      const decrypted = await Aes.decrypt(encrypted.cipher, key, iv, 'aes-256-cbc');
      console.log('🔐 Decrypted data size:', decrypted.length);

      // Parse and return data
      const result = JSON.parse(decrypted);
      console.log('🔐 Decryption successful');
      return result;
    } catch (error) {
      console.error('❌ Decryption failed:', error);
      console.error('❌ Error details:', {
        passwordProvided: !!password,
        encryptedDataProvided: !!encryptedData,
        encryptedDataLength: encryptedData?.length,
      });
      throw new Error('Failed to decrypt data - invalid password');
    }
  }
}

export const encryptionService = new EncryptionService();
