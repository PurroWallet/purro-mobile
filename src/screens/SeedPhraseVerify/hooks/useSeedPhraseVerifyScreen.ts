import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import range from 'lodash/range';
import shuffle from 'lodash/shuffle';
import sortBy from 'lodash/sortBy';
import { useCallback, useMemo, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useProtectedScreen } from '@/core/hooks/security';
import type { NavigationProp, RootStackParamList } from '@/types/navigation';
import { useTranslation } from '@/utils/i18n';

export interface VerificationField {
  position: number;
  name: string;
}

export interface SeedPhraseVerifyStrings {
  title: string;
  subtitle: string;
  continue: string;
  wordLabel: (number: number) => string;
}

export interface UseSeedPhraseVerifyScreenResult {
  form: UseFormReturn<Record<string, string>>;
  verificationFields: VerificationField[];
  strings: SeedPhraseVerifyStrings;
  canContinue: boolean;
  handleContinue: () => void;
  setFocus: UseFormReturn<Record<string, string>>['setFocus'];
}

const buildDefaultValues = (fields: VerificationField[]) =>
  fields.reduce<Record<string, string>>((acc, field) => {
    acc[field.name] = '';
    return acc;
  }, {});

export const useSeedPhraseVerifyScreen = (): UseSeedPhraseVerifyScreenResult => {
  const navigation = useNavigation<NavigationProp<'SeedPhraseVerify'>>();
  const route = useRoute<RouteProp<RootStackParamList, 'SeedPhraseVerify'>>();
  const { mnemonic } = route.params;
  const { t } = useTranslation();

  const words = useMemo(() => mnemonic.split(' '), [mnemonic]);

  const createVerificationPlan = useCallback(() => {
    if (words.length === 0) {
      return [] as number[];
    }

    return sortBy(shuffle(range(0, words.length)).slice(0, Math.min(3, words.length)));
  }, [words]);

  const [verificationFields, setVerificationFields] = useState<VerificationField[]>(() =>
    createVerificationPlan().map((position) => ({
      position,
      name: `word_${position}`,
    })),
  );

  const form = useForm<Record<string, string>>({
    defaultValues: buildDefaultValues(verificationFields),
    mode: 'onChange',
    shouldUnregister: true,
  });

  const regenerateVerification = useCallback(() => {
    const positions = createVerificationPlan();
    const fields = positions.map((position) => ({
      position,
      name: `word_${position}`,
    }));

    setVerificationFields(fields);
    form.reset(buildDefaultValues(fields));
  }, [createVerificationPlan, form]);

  const formValues = form.watch();

  const canContinue = useMemo(
    () =>
      verificationFields.length > 0 &&
      verificationFields.every((field) => {
        const value = formValues[field.name];
        return value?.trim().length;
      }),
    [formValues, verificationFields],
  );

  const onSubmit = useCallback(
    (values: Record<string, string>) => {
      const isValid = verificationFields.every((field) => {
        const inputWord = values[field.name]?.toLowerCase().trim();
        const correctWord = words[field.position];
        return inputWord === correctWord;
      });

      if (!isValid) {
        regenerateVerification();
        return;
      }

      navigation.navigate('CreatePassword', { mnemonic });
    },
    [mnemonic, navigation, regenerateVerification, verificationFields, words],
  );

  const handleContinue = useCallback(() => {
    form.handleSubmit(onSubmit)();
  }, [form, onSubmit]);

  useProtectedScreen('SeedPhrase');

  const strings = useMemo<SeedPhraseVerifyStrings>(
    () => ({
      title: t('seedPhrase.verify.title'),
      subtitle: t('seedPhrase.verify.subtitle'),
      continue: t('seedPhrase.verify.actions.continue'),
      wordLabel: (number: number) =>
        t('seedPhrase.verify.wordLabel', {
          number,
        }),
    }),
    [t],
  );

  return {
    form,
    verificationFields,
    strings,
    canContinue,
    handleContinue,
    setFocus: form.setFocus,
  };
};
