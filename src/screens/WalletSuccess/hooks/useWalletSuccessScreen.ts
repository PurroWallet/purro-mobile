import { useCallback, useMemo } from 'react';
import type { WalletSuccessScreenProps } from '@/types/navigation';
import { useTranslation } from '@/utils/i18n';

export interface WalletSuccessStrings {
  title: string;
  subtitle: string;
  cta: string;
}

export interface UseWalletSuccessScreenResult {
  strings: WalletSuccessStrings;
  onGetStarted: () => void;
}

export const useWalletSuccessScreen = (
  navigation: WalletSuccessScreenProps['navigation'],
): UseWalletSuccessScreenResult => {
  const { t } = useTranslation();

  const onGetStarted = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  }, [navigation]);

  const strings = useMemo<WalletSuccessStrings>(
    () => ({
      title: t('walletSuccess.title'),
      subtitle: t('walletSuccess.subtitle'),
      cta: t('walletSuccess.actions.cta'),
    }),
    [t],
  );

  return { strings, onGetStarted };
};
