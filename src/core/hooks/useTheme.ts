import { type ThemeMode, useThemeStore } from '@/theme';

export function useThemeMode() {
  const themeMode = useThemeStore((state) => state.themeMode);
  const setThemeMode = useThemeStore((state) => state.setThemeMode);
  const toggleThemeMode = useThemeStore((state) => state.toggleThemeMode);

  return {
    themeMode,
    setThemeMode,
    toggleThemeMode,
  };
}
