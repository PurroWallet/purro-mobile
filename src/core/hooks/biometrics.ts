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

    // Only use supported biometry type, don't force enable
    const effectiveSupported = supportedBiometryType;
    const isFaceID = effectiveSupported === BIOMETRY_TYPE.FACE_ID;
    const isTouchID = effectiveSupported === BIOMETRY_TYPE.TOUCH_ID;

    return {
      isBiometricsEnabled: authEnabled && !!effectiveSupported,
      settingsAuthEnabled: authEnabled,
      couldSetupBiometrics: !!effectiveSupported,
      supportedBiometryType: effectiveSupported,
      defaultTypeLabel: isFaceID ? 'Face ID' : isTouchID ? 'Touch ID' : 'Fingerprint',
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount - setBiometricsInfo is stable from zustand

  const fetchBiometrics = useCallback(async () => {
    try {
      let supportedType = null as null | BIOMETRY_TYPE;
      try {
        supportedType = await apisKeychain.getSupportedBiometryType();
      } catch (error) {
        // Handle error silently
      }

      const authEnabled = supportedType ? isAuthenticatedByBiometrics() : false;

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

      console.log('🔐 toggleBiometrics: Called with', {
        nextEnabled,
        hasValidatedPassword: !!validatedPassword,
      });

      try {
        if (nextEnabled && validatedPassword) {
          console.log(
            '🔐 toggleBiometrics: Enabling biometrics with password length:',
            validatedPassword.length,
          );
          // Enable biometrics
          await apisKeychain.setGenericPassword(validatedPassword, KEYCHAIN_AUTH_TYPES.BIOMETRICS);
          console.log('🔐 toggleBiometrics: Keychain set successful, updating state');
          setBiometricsInfo((prev) => ({ ...prev, authEnabled: true }));
          console.log('🔐 toggleBiometrics: State updated to enabled');
        } else {
          console.log('🔐 toggleBiometrics: Disabling biometrics');
          // Disable biometrics
          await apisKeychain.resetGenericPassword();
          console.log('🔐 toggleBiometrics: Keychain reset successful, updating state');
          setBiometricsInfo((prev) => ({ ...prev, authEnabled: false }));
          console.log('🔐 toggleBiometrics: State updated to disabled');
        }
      } catch (error) {
        console.error('❌ toggleBiometrics: Error occurred:', error);
        console.error('❌ toggleBiometrics: Error details:', JSON.stringify(error));
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
