import { colorScheme as globalColorScheme } from 'nativewind';
import React, { PropsWithChildren, useEffect } from 'react';
import { Appearance } from 'react-native';
import { preferenceService } from '@/core/services/preference';
import { useThemeStore } from '@/theme';

export const ThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const setThemeMode = useThemeStore((state) => state.setThemeMode);

  useEffect(() => {
    const savedMode = preferenceService.getPreference('themeMode');
    if (savedMode === 'light' || savedMode === 'dark') {
      globalColorScheme.set(savedMode);
      setThemeMode(savedMode, { persist: false });
    }

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (colorScheme === 'light' || colorScheme === 'dark') {
        globalColorScheme.set(colorScheme);
        setThemeMode(colorScheme, { persist: false });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [setThemeMode]);

  return <>{children}</>;
};
