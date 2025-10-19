import { useCallback } from 'react';
import { type ThemeMode, useThemeStore } from '@/theme';

export function useThemeMode() {
  const themeMode = useThemeStore((state) => state.themeMode);
  const setThemeModeStore = useThemeStore((state) => state.setThemeMode);
  const toggleThemeModeStore = useThemeStore((state) => state.toggleThemeMode);

  const setThemeMode = useCallback(
    (mode: ThemeMode) => {
      setThemeModeStore(mode);
    },
    [setThemeModeStore],
  );

  const toggleThemeMode = useCallback(() => {
    toggleThemeModeStore();
  }, [toggleThemeModeStore]);

  return {
    themeMode,
    setThemeMode,
    toggleThemeMode,
  };
}
