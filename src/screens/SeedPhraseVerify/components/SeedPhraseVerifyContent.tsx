import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { FormProvider } from 'react-hook-form';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components';
import type {
  SeedPhraseVerifyStrings,
  VerificationField,
} from '../hooks/useSeedPhraseVerifyScreen';
import { ProgressIndicator } from './ProgressIndicator';
import { WordInput } from './WordInput';

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
  <SafeAreaView className="flex-1 bg-primary">
    <View className="flex-1 items-center justify-between px-5 pb-10 pt-5">
      <ProgressIndicator />

      <View className="items-center gap-4">
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
  </SafeAreaView>
);
