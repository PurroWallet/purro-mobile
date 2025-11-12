import { useNavigation } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import type { NavigationProp } from '@/types/navigation';
import { useTranslation } from '@/utils/i18n';

export interface ImportMethodOption {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

export interface ImportMethodsStrings {
  headerTitle: string;
  subtitle: string;
  warningTitle: string;
  warningDescription: string;
}

export interface UseImportMethodsScreenResult {
  strings: ImportMethodsStrings;
  options: ImportMethodOption[];
  onBackPress: () => void;
}

export const useImportMethodsScreen = (): UseImportMethodsScreenResult => {
  const navigation = useNavigation<NavigationProp<'ImportMethods'>>();
  const { t } = useTranslation();

  const handleImportSeedPhrase = useCallback(() => {
    navigation.navigate('ImportSeedPhrase');
  }, [navigation]);

  const handleImportPrivateKey = useCallback(() => {
    navigation.navigate('ImportPrivateKey');
  }, [navigation]);

  const options = useMemo<ImportMethodOption[]>(
    () => [
      {
        icon: 'ImportMnemonic',
        title: t('importMethods.seed.title'),
        subtitle: t('importMethods.seed.subtitle'),
        onPress: handleImportSeedPhrase,
      },
      {
        icon: 'ImportPrivateKey',
        title: t('importMethods.privateKey.title'),
        subtitle: t('importMethods.privateKey.subtitle'),
        onPress: handleImportPrivateKey,
      },
    ],
    [handleImportPrivateKey, handleImportSeedPhrase, t],
  );

  const strings = useMemo<ImportMethodsStrings>(
    () => ({
      headerTitle: t('importMethods.title'),
      subtitle: t('importMethods.subtitle'),
      warningTitle: t('importMethods.warning.title'),
      warningDescription: t('importMethods.warning.description'),
    }),
    [t],
  );

  const onBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return { strings, options, onBackPress };
};
