import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { FormProvider } from 'react-hook-form';
import { Text, View } from 'react-native';
import { Button } from '@/components';
import { WordInput } from './WordInput';

interface VerificationField {
  position: number;
  name: string;
  correctWord: string;
}

interface SeedPhraseVerifyStrings {
  title: string;
  subtitle: string;
  wordLabel: (number: number) => string;
  continue: string;
}

interface SeedPhraseVerifyContentProps {
  form: UseFormReturn<Record<string, string>>;
  verificationFields: VerificationField[];
  strings: SeedPhraseVerifyStrings;
  canContinue: boolean;
  handleContinue: () => void;
  setFocus: UseFormReturn<Record<string, string>>['setFocus'];
}

export const SeedPhraseVerifyContent: React.FC<SeedPhraseVerifyContentProps> = ({
  form,
  verificationFields,
  strings,
  canContinue,
  handleContinue,
  setFocus,
}) => (
  <View className="flex-1">
    <View className="flex-1 items-center justify-center px-5 pt-5">
      <View className="mb-8">
        <View className="h-1 w-16 rounded-full bg-brand-primary" />
        <View className="mt-2 h-1 w-16 rounded-full bg-border" />
      </View>

      <View className="items-center gap-4 mb-8">
        <Text className="w-[335px] text-center text-h4 text-text-primary">{strings.title}</Text>
        <Text className="w-[335px] text-center text-button text-text-secondary">
          {strings.subtitle}
        </Text>
      </View>

      <FormProvider {...form}>
        <View className="w-full gap-6">
          {verificationFields.map((field, index) => (
            <WordInput
              key={field.name}
              name={field.name}
              label={strings.wordLabel(field.position + 1)}
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
      <Button
        type="primary"
        title={strings.continue}
        onPress={handleContinue}
        disabled={!canContinue}
      />
    </View>
  </View>
);

SeedPhraseVerifyContent.displayName = 'SeedPhraseVerifyContent';
