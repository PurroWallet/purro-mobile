import { useCallback } from 'react';
import {
  type CreateWalletProcess,
  useCreateWalletStore,
  WalletCreationType,
} from '@/stores/createWalletStore';

export function useCreateWallet() {
  const walletProc = useCreateWalletStore((state) => state.process);
  const setProcess = useCreateWalletStore((state) => state.setProcess);
  const resetProcess = useCreateWalletStore((state) => state.resetProcess);

  const preGenerateSeedPhrase = useCallback(async () => {
    if (walletProc.seedPhrase) {
      return;
    }

    try {
      const mnemonic = await useCreateWalletStore.getState().generateSeedPhrase();
      if (!mnemonic) {
        return;
      }
      setProcess((prev) => ({
        ...prev,
        seedPhrase: mnemonic,
        isGenerating: false,
        error: null,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setProcess((prev) => ({
        ...prev,
        isGenerating: false,
        error: errorMessage,
      }));
    }
  }, [walletProc.seedPhrase, setProcess]);

  const getSeedPhrase = useCallback(async (): Promise<{
    mnemonic: string;
  }> => {
    if (walletProc.seedPhrase) {
      return {
        mnemonic: walletProc.seedPhrase,
      };
    }

    setProcess((prev) => ({
      ...prev,
      isGenerating: true,
      error: null,
    }));

    try {
      const mnemonic = await useCreateWalletStore.getState().generateSeedPhrase();
      if (!mnemonic) {
        throw new Error('Unknown error');
      }
      setProcess((prev) => ({
        ...prev,
        seedPhrase: mnemonic,
        isGenerating: false,
        error: null,
      }));

      return { mnemonic };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setProcess((prev) => ({
        ...prev,
        isGenerating: false,
        error: errorMessage,
      }));
      throw new Error(errorMessage);
    }
  }, [setProcess, walletProc.seedPhrase]);

  const storePassword = useCallback(
    (passwordForm: CreateWalletProcess['passwordForm']) => {
      setProcess((prev) => ({
        ...prev,
        passwordForm: {
          ...prev.passwordForm,
          ...passwordForm,
        },
      }));
    },
    [setProcess],
  );

  const resetCreateWallet = useCallback(() => {
    resetProcess();
  }, [resetProcess]);

  const startCreateWallet = useCallback(() => {
    setProcess((prev) => ({
      ...prev,
      type: WalletCreationType.Create,
    }));
  }, [setProcess]);

  const startImportWallet = useCallback(() => {
    setProcess((prev) => ({
      ...prev,
      type: WalletCreationType.Import,
    }));
  }, [setProcess]);

  return {
    createWalletProc: walletProc,
    preGenerateSeedPhrase,
    getSeedPhrase,
    storePassword,
    resetCreateWallet,
    startCreateWallet,
    startImportWallet,
  };
}
