import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { usePreventScreenshot } from '@/core/hooks/native/security';
import type { NavigationProp, RootStackParamList } from '@/types/navigation';
import { useTranslation } from '@/utils/i18n';

export interface SeedWordData {
  index: number;
  word: string;
}

export interface SeedPhraseDisplayStrings {
  title: string;
  confirmation: string;
  warning: string;
  continue: string;
}

export interface UseSeedPhraseDisplayScreenResult {
  strings: SeedPhraseDisplayStrings;
  words: SeedWordData[];
  isConfirmed: boolean;
  onToggleConfirmation: () => void;
  onContinue: () => void;
}

export const useSeedPhraseDisplayScreen = (): UseSeedPhraseDisplayScreenResult => {
  const navigation = useNavigation<NavigationProp<'SeedPhraseDisplay'>>();
  const route = useRoute<RouteProp<RootStackParamList, 'SeedPhraseDisplay'>>();
  const { mnemonic } = route.params;
  const { t } = useTranslation();

  const [isConfirmed, setIsConfirmed] = useState(false);

  const words = useMemo<SeedWordData[]>(
    () => mnemonic.split(' ').map((word, index) => ({ word, index: index + 1 })),
    [mnemonic],
  );

  usePreventScreenshot(true);

  const onContinue = useCallback(() => {
    if (!isConfirmed) {
      return;
    }

    navigation.navigate('SeedPhraseVerify', { mnemonic });
  }, [isConfirmed, mnemonic, navigation]);

  const onToggleConfirmation = useCallback(() => {
    setIsConfirmed((prev) => !prev);
  }, []);

  const strings = useMemo<SeedPhraseDisplayStrings>(
    () => ({
      title: t('seedPhrase.display.title'),
      confirmation: t('seedPhrase.display.confirmation'),
      warning: t('seedPhrase.display.warning'),
      continue: t('seedPhrase.display.actions.continue'),
    }),
    [t],
  );

  return {
    strings,
    words,
    isConfirmed,
    onToggleConfirmation,
    onContinue,
  };
};
