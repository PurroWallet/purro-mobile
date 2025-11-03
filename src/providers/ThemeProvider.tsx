import { colorScheme as globalColorScheme } from 'nativewind';
import React, { PropsWithChildren, useEffect } from 'react';
import { Appearance } from 'react-native';
import { preferenceService } from '@/core/services/preference';
import { useThemeStore } from '@/theme';

export const ThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const setThemeMode = useThemeStore((state) => state.setThemeMode);

  useEffect(() => {
    // Initialize theme from storage
    const initTheme = () => {
      const savedMode = preferenceService.getPreference('themeMode');

      if (savedMode === 'light' || savedMode === 'dark') {
        console.log('🎨 ThemeProvider - Loading saved theme:', savedMode);
        setThemeMode(savedMode, { persist: false });
      } else {
        // If no saved theme, use system theme
        const systemTheme = Appearance.getColorScheme();
        const initialMode = systemTheme === 'dark' ? 'dark' : 'light';
        console.log('🎨 ThemeProvider - No saved theme, using system:', initialMode);
        setThemeMode(initialMode, { persist: true });
      }
    };

    initTheme();

    // Listen to system theme changes (optional)
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      // Only update if user hasn't set a preference
      const savedMode = preferenceService.getPreference('themeMode');
      if (!savedMode && (colorScheme === 'light' || colorScheme === 'dark')) {
        console.log('🎨 ThemeProvider - System theme changed:', colorScheme);
        setThemeMode(colorScheme, { persist: false });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [setThemeMode]);

  return <>{children}</>;
};
