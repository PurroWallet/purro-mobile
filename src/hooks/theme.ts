import { useMemo } from 'react';

// Mock theme colors - in real app this would come from theme system
const mockColors = {
  'neutral-bg1': '#FFFFFF',
  'neutral-title1': '#000000',
  'neutral-body': '#666666',
  'neutral-line': '#E0E0E0',
};

export function useThemeStyles<T>(
  getStyles: (colors: typeof mockColors) => T,
): { styles: T } {
  const styles = useMemo(() => getStyles(mockColors), [getStyles]);

  return { styles };
}

export function useGetBinaryMode(): 'light' | 'dark' {
  return 'light'; // TODO: implement theme detection
}

