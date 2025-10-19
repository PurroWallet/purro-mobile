import { colorScheme as globalColorScheme } from 'nativewind';
import { create } from 'zustand';
import { preferenceService } from '@/core/services/preference';

export type ThemeMode = 'light' | 'dark';

type SetThemeOptions = {
  persist?: boolean;
};

interface ThemeState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode, options?: SetThemeOptions) => void;
  toggleThemeMode: () => void;
}

const applyTheme = (mode: ThemeMode, persist: boolean) => {
  globalColorScheme.set(mode);

  if (persist) {
    preferenceService.setPreference('themeMode', mode);
  }
};

export const useThemeStore = create<ThemeState>()((set, get) => ({
  themeMode: 'light',
  setThemeMode: (mode, options) => {
    const persist = options?.persist ?? true;
    applyTheme(mode, persist);
    set({ themeMode: mode });
  },
  toggleThemeMode: () => {
    const nextMode: ThemeMode = get().themeMode === 'dark' ? 'light' : 'dark';
    get().setThemeMode(nextMode);
  },
}));
