import React, { PropsWithChildren, useEffect } from 'react';
import { Appearance } from 'react-native';
import { colorScheme as globalColorScheme } from 'nativewind';
import { useAtom } from 'jotai';
import { preferenceService } from '@/core/services/preference';
import { themeModeAtom } from '@/theme';

export const ThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [, setThemeMode] = useAtom(themeModeAtom);

  useEffect(() => {
    const savedMode = preferenceService.getPreference('themeMode');
    if (savedMode === 'light' || savedMode === 'dark') {
      globalColorScheme.set(savedMode);
      setThemeMode(savedMode);
    }

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (colorScheme === 'light' || colorScheme === 'dark') {
        globalColorScheme.set(colorScheme);
        setThemeMode(colorScheme);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [setThemeMode]);

  return <>{children}</>;
};