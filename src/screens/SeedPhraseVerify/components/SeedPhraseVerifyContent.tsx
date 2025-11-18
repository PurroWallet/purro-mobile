import React from 'react';
import { FormProvider } from 'react-hook-form';
import { Text, View } from 'react-native';
import { Button } from '@/components';
import { useSeedPhraseVerifyScreen } from '../hooks/useSeedPhraseVerifyScreen';
import { ProgressIndicator } from './ProgressIndicator';
import { WordInput } from './WordInput';

export const SeedPhraseVerifyContent: React.FC = () => {
  const { form, verificationFields, strings, canContinue, handleContinue, setFocus } =
    useSeedPhraseVerifyScreen();

  return (
    <View className="flex-1 bg-primary">
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
    </View>
  );
};
