// This file is reserved for future hardware wallet support
// Currently not implemented as per user request

/**
 * Hardware Keyring interface for future hardware wallet support
 * This is a placeholder for future implementation
 */
export interface IHardwareKeyringOptions {
  deviceId?: string;
  deviceName?: string;
  connectionType?: 'usb' | 'bluetooth' | 'nfc';
}

/**
 * Note: Hardware wallet support will be implemented in the future
 * The architecture is designed to be extensible for hardware wallets
 * when needed. The following components are already in place:
 *
 * - KEYRING_TYPE.Hardware in types.ts (can be added back when needed)
 * - KeyringService.createHardwareKeyring method (can be added back when needed)
 * - WalletController.importHardwareWallet method (can be added back when needed)
 *
 * The implementation would follow the same pattern as HDKeyring and SimpleKeyring
 * but with hardware-specific connection and signing methods.
 */
