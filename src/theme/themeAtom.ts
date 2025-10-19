import { atom } from 'jotai';

export type ThemeMode = 'light' | 'dark';

export const themeModeAtom = atom<ThemeMode>('light');
