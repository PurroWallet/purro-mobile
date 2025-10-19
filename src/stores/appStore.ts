import { create } from 'zustand';

interface AppState {
  route: string;
  walletExists: boolean;
  walletUnlocked: boolean;
  setRoute: (route: string) => void;
  setWalletExists: (exists: boolean) => void;
  setWalletUnlocked: (unlocked: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  route: 'Welcome',
  walletExists: false,
  walletUnlocked: false,
  setRoute: (route) => set({ route }),
  setWalletExists: (walletExists) => set({ walletExists }),
  setWalletUnlocked: (walletUnlocked) => set({ walletUnlocked }),
}));
