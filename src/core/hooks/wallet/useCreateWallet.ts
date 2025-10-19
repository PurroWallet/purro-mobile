import { atom, useAtom } from 'jotai';
import { apisWallet } from '@/core/apis/wallet';

export enum WalletCreationType {
  Create = 1,
  Import = 2,
}

type CreateWalletProcess = {
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

function getDefaultCreateWalletProc(): CreateWalletProcess {
  return {
    type: WalletCreationType.Create,
    seedPhrase: '',
    passwordForm: {
      password: '',
      confirmPassword: '',
      enableBiometrics: false,
    },
    isGenerating: false,
    error: null,
  };
}

const createWalletProcess = atom<CreateWalletProcess>(
  getDefaultCreateWalletProc(),
);

export function useCreateWallet() {
  const [walletProc, setWalletProc] = useAtom(createWalletProcess);

  const preGenerateSeedPhrase = async () => {
    if (walletProc.seedPhrase) {
      return;
    }

    try {
      const mnemonic = await apisWallet.generateMnemonic();
      setWalletProc(prev => ({
        ...prev,
        seedPhrase: mnemonic,
        isGenerating: false,
        error: null,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setWalletProc(prev => ({
        ...prev,
        isGenerating: false,
        error: errorMessage,
      }));
    }
  };

  const getSeedPhrase = async (): Promise<{
    mnemonic: string;
  }> => {
    if (walletProc.seedPhrase) {
      return {
        mnemonic: walletProc.seedPhrase,
      };
    }

    setWalletProc(prev => ({
      ...prev,
      isGenerating: true,
      error: null,
    }));

    try {
      const mnemonic = await apisWallet.generateMnemonic();
      setWalletProc(prev => ({
        ...prev,
        seedPhrase: mnemonic,
        isGenerating: false,
        error: null,
      }));

      return { mnemonic };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setWalletProc(prev => ({
        ...prev,
        isGenerating: false,
        error: errorMessage,
      }));
      throw new Error(errorMessage);
    }
  };

  const storePassword = (passwordForm: CreateWalletProcess['passwordForm']) => {
    setWalletProc(prev => ({
      ...prev,
      passwordForm: {
        ...prev.passwordForm,
        ...passwordForm,
      },
    }));
  };

  const resetCreateWallet = () => {
    setWalletProc(getDefaultCreateWalletProc());
  };

  const startCreateWallet = () => {
    setWalletProc(prev => ({
      ...prev,
      type: WalletCreationType.Create,
    }));
  };

  const startImportWallet = () => {
    setWalletProc(prev => ({
      ...prev,
      type: WalletCreationType.Import,
    }));
  };

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
