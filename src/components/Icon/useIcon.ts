import type { LucideProps } from 'lucide-react-native';
import * as LucideIcons from 'lucide-react-native';
import { useMemo } from 'react';
import { customIcons } from '@/assets/icons';

type LucideIconComponent = React.ComponentType<LucideProps>;
type CustomIconComponent = React.ComponentType<{
  size?: number;
  color?: string;
}>;

export type IconResolution =
  | { type: 'lucide'; Component: LucideIconComponent }
  | { type: 'custom'; Component: CustomIconComponent }
  | { type: 'none' };

const lucideIconMap = LucideIcons as unknown as Record<string, LucideIconComponent>;

const toPascalCase = (value: string) =>
  value
    .split(/[-_\s]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

export const useIcon = (name: string): IconResolution => {
  return useMemo(() => {
    const lucideKey = toPascalCase(name);
    const LucideComponent = lucideIconMap[lucideKey];
    if (LucideComponent) {
      return { type: 'lucide', Component: LucideComponent } as const;
    }

    const customKey = name.toLowerCase();
    const CustomComponent = customIcons[customKey];

    if (CustomComponent) {
      return { type: 'custom', Component: CustomComponent } as const;
    }

    return { type: 'none' } as const;
  }, [name]);
};
