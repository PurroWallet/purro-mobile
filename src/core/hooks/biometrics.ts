/**
 * Biometrics hooks for Face ID / Touch ID authentication
 */

import { useCallback, useEffect, useMemo } from 'react';
import { Platform } from 'react-native';
import { BIOMETRY_TYPE } from 'react-native-keychain';
import { apisKeychain } from '@/core/apis';
import { isAuthenticatedByBiometrics, KEYCHAIN_AUTH_TYPES } from '@/core/services/keychain';
import { useBiometricsStore } from '@/stores/biometricsStore';

const IS_IOS = Platform.OS === 'ios';

/**
 * Computed biometrics information
 */
export function useBiometricsComputed() {
  const biometrics = useBiometricsStore((state) => state.info);

  const computed = useMemo(() => {
    const { authEnabled, supportedBiometryType } = biometrics;

    // Force enable for testing if on iOS (even if getSupportedBiometryType returns null)
    const forceEnable = IS_IOS && !supportedBiometryType;
    const effectiveSupported =
      supportedBiometryType || (forceEnable ? BIOMETRY_TYPE.FACE_ID : null);
    const isFaceID = effectiveSupported === BIOMETRY_TYPE.FACE_ID || forceEnable;

    return {
      isBiometricsEnabled: authEnabled && !!effectiveSupported,
      settingsAuthEnabled: authEnabled,
      couldSetupBiometrics: !!effectiveSupported,
      supportedBiometryType: effectiveSupported,
      defaultTypeLabel: isFaceID ? 'Face ID' : IS_IOS ? 'Touch ID' : 'Fingerprint',
      isFaceID,
    };
  }, [biometrics]);

  return computed;
}

/**
 * Main biometrics hook with full functionality
 */
export function useBiometrics(_options?: { autoFetch?: boolean }) {
  const biometrics = useBiometricsStore((state) => state.info);
  const setBiometricsInfo = useBiometricsStore((state) => state.setInfo);

  useEffect(() => {
    const initialize = async () => {
      const supportedType = await apisKeychain.getSupportedBiometryType();
      setBiometricsInfo((prev) => ({
        ...prev,
        supportedBiometryType: supportedType,
      }));
    };

    initialize();
  }, [setBiometricsInfo]);

  const fetchBiometrics = useCallback(async () => {
    try {
      let supportedType = null as null | BIOMETRY_TYPE;
      try {
        supportedType = await apisKeychain.getSupportedBiometryType();
        console.log('🔐 Supported biometry type:', supportedType);
      } catch (error) {
        console.error('❌ Error getting supported biometry type:', error);
      }

      const authEnabled = supportedType ? isAuthenticatedByBiometrics() : false;
      console.log('🔐 Auth enabled:', authEnabled, 'Supported type:', supportedType);

      setBiometricsInfo((prev) => ({
        ...prev,
        supportedBiometryType: supportedType,
        authEnabled: authEnabled,
      }));
    } catch (error) {
      console.error('❌ fetchBiometrics error:', error);
    }
  }, [setBiometricsInfo]);

  const toggleBiometrics = useCallback(
    async <T extends boolean>(
      nextEnabled: T,
      input: { tipLoading?: boolean } & (T extends true
        ? { validatedPassword: string }
        : { validatedPassword?: undefined }),
    ) => {
      const { validatedPassword } = input;

      try {
        if (nextEnabled && validatedPassword) {
          // Enable biometrics
          await apisKeychain.setGenericPassword(validatedPassword, KEYCHAIN_AUTH_TYPES.BIOMETRICS);
          setBiometricsInfo((prev) => ({ ...prev, authEnabled: true }));
        } else {
          // Disable biometrics
          await apisKeychain.resetGenericPassword();
          setBiometricsInfo((prev) => ({ ...prev, authEnabled: false }));
        }
      } catch (error) {
        console.error('Toggle biometrics error:', error);
        throw error;
      }
    },
    [setBiometricsInfo],
  );

  const computed = useBiometricsComputed();

  return {
    biometrics,
    computed,
    toggleBiometrics,
    fetchBiometrics,
  };
}

/**
 * Hook for verifying with biometrics
 */
export function useVerifyByBiometrics() {
  const { computed } = useBiometrics();

  const verifyByBiometrics = useCallback(async () => {
    if (!computed.isBiometricsEnabled) {
      throw new Error('Biometrics not enabled');
    }

    try {
      const result = await apisKeychain.requestGenericPassword();
      return result;
    } catch (error) {
      console.error('Biometric verification failed:', error);
      throw error;
    }
  }, [computed.isBiometricsEnabled]);

  return {
    verifyByBiometrics,
    isBiometricsAvailable: computed.isBiometricsEnabled,
  };
}
