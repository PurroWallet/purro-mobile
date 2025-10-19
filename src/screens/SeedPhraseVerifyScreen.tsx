import range from 'lodash/range';
import shuffle from 'lodash/shuffle';
import sortBy from 'lodash/sortBy';
import React, { useCallback, useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormInput } from '@/components';
import { useProtectedScreen } from '@/core/hooks/security';
import { SeedPhraseVerifyScreenProps } from '@/types/navigation';
import { useTranslation } from '@/utils/i18n';

const ProgressIndicator = () => (
  <View className="mb-14 w-[240px]">
    <View className="h-[3px] flex-row gap-1 rounded-full">
      <View className="h-[3px] flex-1 rounded-full bg-brand-primary" />
      <View className="h-[3px] flex-1 rounded-full bg-brand-primary" />
      <View className="h-[3px] flex-1 rounded-full bg-background-tertiary" />
      <View className="h-[3px] flex-1 rounded-full bg-background-tertiary" />
    </View>
  </View>
);

type VerificationField = {
  position: number;
  name: string;
};

const buildDefaultValues = (fields: VerificationField[]) =>
  fields.reduce<Record<string, string>>((acc, field) => {
    acc[field.name] = '';
    return acc;
  }, {});

const WordInput = ({
  name,
  label,
  returnKeyType,
  onSubmitEditing,
}: {
  name: string;
  label: string;
  returnKeyType: 'next' | 'done';
  onSubmitEditing: () => void;
}) => (
  <FormInput
    name={name}
    label={label}
    placeholder={label}
    autoCapitalize="none"
    autoCorrect={false}
    textContentType="oneTimeCode"
    returnKeyType={returnKeyType}
    onSubmitEditing={onSubmitEditing}
  />
);

const SeedPhraseVerifyScreen: React.FC<SeedPhraseVerifyScreenProps> = ({ route, navigation }) => {
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

  const { setFocus } = form;

  // Enable screenshot prevention for this screen
  useProtectedScreen('SeedPhrase');

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

  const canContinue =
    verificationFields.length > 0 &&
    verificationFields.every((field) => {
      const value = (formValues as Record<string, string>)[field.name];
      return value?.trim().length;
    });

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
    [verificationFields, words, regenerateVerification, navigation, mnemonic],
  );

  const handleContinue = useCallback(() => {
    form.handleSubmit(onSubmit)();
  }, [form, onSubmit]);

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <View className="flex-1 items-center justify-between px-5 pb-10 pt-5">
        <ProgressIndicator />

        <View className="items-center gap-4">
          <Text className="w-[335px] text-center text-h4 text-text-primary">
            {t('seedPhrase.verify.title')}
          </Text>
          <Text className="w-[335px] text-center text-button text-text-secondary">
            {t('seedPhrase.verify.subtitle')}
          </Text>
        </View>

        <FormProvider {...form}>
          <View className="w-full gap-6">
            {verificationFields.map((field, index) => (
              <WordInput
                key={field.name}
                name={field.name}
                label={t('seedPhrase.verify.wordLabel', {
                  number: field.position + 1,
                })}
                returnKeyType={index === verificationFields.length - 1 ? 'done' : 'next'}
                onSubmitEditing={
                  index === verificationFields.length - 1
                    ? handleContinue
                    : () => setFocus(verificationFields[index + 1].name)
                }
              />
            ))}
          </View>
        </FormProvider>
      </View>

      <View className="px-5 pb-5">
        <TouchableOpacity
          className={`w-full min-h-12 items-center justify-center rounded-xl px-6 py-4 ${canContinue ? 'bg-brand-primary' : 'bg-button-primary-disabled'}`}
          onPress={handleContinue}
          disabled={!canContinue}
        >
          <Text
            className={`text-button ${canContinue ? 'text-button-primary-text' : 'text-button-primary-disabled-text'}`}
          >
            {t('seedPhrase.verify.actions.continue')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SeedPhraseVerifyScreen;
