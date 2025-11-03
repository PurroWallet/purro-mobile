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
  console.log('🎨 Applying theme:', mode, 'persist:', persist);
  globalColorScheme.set(mode);

  if (persist) {
    preferenceService.setPreference('themeMode', mode);
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

export const useThemeStore = create<ThemeState>()((set, get) => ({
  themeMode: getInitialTheme(),
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
