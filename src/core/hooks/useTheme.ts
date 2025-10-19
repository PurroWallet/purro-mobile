import { useCallback, useEffect } from 'react';
import { useAtom } from 'jotai';
import { themeModeAtom, type ThemeMode } from '@/theme';
import { preferenceService } from '@/core/services/preference';
import { colorScheme as globalColorScheme } from 'nativewind';

export function useThemeMode() {
  const [storedMode, setStoredMode] = useAtom(themeModeAtom);

  useEffect(() => {
    const savedMode = preferenceService.getPreference('themeMode');
    if (savedMode === 'light' || savedMode === 'dark') {
      setStoredMode(savedMode);
      globalColorScheme.set(savedMode);
    } else {
      const systemScheme = globalColorScheme.get();
      if (systemScheme === 'light' || systemScheme === 'dark') {
        setStoredMode(systemScheme);
      }
    }
  }, [setStoredMode]);

  useEffect(() => {
    if (storedMode === 'light' || storedMode === 'dark') {
      preferenceService.setPreference('themeMode', storedMode);
      globalColorScheme.set(storedMode);
    }
  }, [storedMode]);

  const setThemeMode = useCallback(
    (mode: ThemeMode) => {
      setStoredMode(mode);
    },
    [setStoredMode],
  );

  const toggleThemeMode = useCallback(() => {
    setStoredMode(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, [setStoredMode]);

  const activeMode: ThemeMode = storedMode ?? 'light';

  return {
    themeMode: activeMode,
    setThemeMode,
    toggleThemeMode,
  };
}
