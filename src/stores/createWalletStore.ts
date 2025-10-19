import { create } from 'zustand';
import { apisWallet } from '@/core/apis/wallet';

export enum WalletCreationType {
  Create = 1,
  Import = 2,
}

export type CreateWalletProcess = {
  type: WalletCreationType;
  seedPhrase: string;
  passwordForm: {
    password: string;
    confirmPassword: string;
    enableBiometrics?: boolean;
  };
  isGenerating: boolean;
  error: string | null;
};

const getDefaultCreateWalletProc = (): CreateWalletProcess => ({
  type: WalletCreationType.Create,
  seedPhrase: '',
  passwordForm: {
    password: '',
    confirmPassword: '',
    enableBiometrics: false,
  },
  isGenerating: false,
  error: null,
});

interface CreateWalletState {
  process: CreateWalletProcess;
  setProcess: (
    updater: CreateWalletProcess | ((prev: CreateWalletProcess) => CreateWalletProcess),
  ) => void;
  resetProcess: () => void;
  generateSeedPhrase: () => Promise<string | null>;
}

export const useCreateWalletStore = create<CreateWalletState>((set, get) => ({
  process: getDefaultCreateWalletProc(),
  setProcess: (updater) => {
    set((prevState) => {
      const nextProcess =
        typeof updater === 'function'
          ? (updater as (prev: CreateWalletProcess) => CreateWalletProcess)(prevState.process)
          : updater;
      return {
        ...prevState,
        process: nextProcess,
      };
    });
  },
  resetProcess: () => {
    set({ process: getDefaultCreateWalletProc() });
  },
  generateSeedPhrase: async () => {
    const { process } = get();
    if (process.seedPhrase) {
      return process.seedPhrase;
    }

    set((prev) => ({
      ...prev,
      process: {
        ...prev.process,
        isGenerating: true,
        error: null,
      },
    }));

    try {
      const mnemonic = await apisWallet.generateMnemonic();

      set((prev) => ({
        ...prev,
        process: {
          ...prev.process,
          seedPhrase: mnemonic,
          isGenerating: false,
          error: null,
        },
      }));

      return mnemonic;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      set((prev) => ({
        ...prev,
        process: {
          ...prev.process,
          isGenerating: false,
          error: message,
        },
      }));

      return null;
    }
  },
}));

export { getDefaultCreateWalletProc };
