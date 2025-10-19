import { BIOMETRY_TYPE } from 'react-native-keychain';
import { create } from 'zustand';
import { isAuthenticatedByBiometrics } from '@/core/services/keychain';

interface BiometricsInfo {
  authEnabled: boolean;
  supportedBiometryType: BIOMETRY_TYPE | null;
}

interface BiometricsState {
  info: BiometricsInfo;
  setInfo: (updater: BiometricsInfo | ((prev: BiometricsInfo) => BiometricsInfo)) => void;
}

const initialInfo: BiometricsInfo = {
  authEnabled: isAuthenticatedByBiometrics(),
  supportedBiometryType: null,
};

export const useBiometricsStore = create<BiometricsState>((set) => ({
  info: initialInfo,
  setInfo: (updater) => {
    set((prevState) => ({
      info:
        typeof updater === 'function'
          ? (updater as (prev: BiometricsInfo) => BiometricsInfo)(prevState.info)
          : updater,
    }));
  },
}));
