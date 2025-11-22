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

let persistTimeout: NodeJS.Timeout | null = null;

const applyTheme = (mode: ThemeMode, persist: boolean) => {
  globalColorScheme.set(mode);

  if (persistTimeout) {
    clearTimeout(persistTimeout);
    persistTimeout = null;
  }

  if (persist) {
    persistTimeout = setTimeout(() => {
      preferenceService.setPreference('themeMode', mode);
      persistTimeout = null;
    }, 500);
  }
};

// Get initial theme from storage or default to light
const getInitialTheme = (): ThemeMode => {
  try {
    const savedMode = preferenceService.getPreference('themeMode');
    if (savedMode === 'light' || savedMode === 'dark') {
      console.log('🎨 Initial theme from storage:', savedMode);
      return savedMode;
    }
  } catch (error) {
    console.error('🎨 Failed to load theme:', error);
  }
  console.log('🎨 Using default theme: light');
  return 'light';
};

const initialThemeMode = getInitialTheme();
applyTheme(initialThemeMode, false);

export const useThemeStore = create<ThemeState>()((set, get) => ({
  themeMode: initialThemeMode,
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
