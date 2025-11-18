import React from 'react';
import { FormProvider } from 'react-hook-form';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, FormInput } from '@/components';
import { useImportWalletScreen } from '../hooks/useImportWalletScreen';

export const ImportWalletContent: React.FC = () => {
  const { form, strings, isImporting, isSubmitDisabled, onSubmit } = useImportWalletScreen();
  const { setFocus } = form;

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScrollView className="flex-1 px-5">
        <View className="py-5">
          <Text className="text-h4 text-text-primary mb-2">{strings.title}</Text>
          <Text className="text-button text-text-secondary mb-8">{strings.subtitle}</Text>

          <FormProvider {...form}>
            <View className="gap-4">
              <FormInput
                name="mnemonic"
                label={strings.mnemonicLabel}
                placeholder={strings.mnemonicPlaceholder}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => setFocus('password')}
              />

              <FormInput
                name="password"
                label={strings.passwordLabel}
                placeholder={strings.passwordPlaceholder}
                secureTextEntry
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => setFocus('confirmPassword')}
              />

              <FormInput
                name="confirmPassword"
                label={strings.confirmPasswordLabel}
                placeholder={strings.confirmPasswordPlaceholder}
                secureTextEntry
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={onSubmit}
              />
            </View>
          </FormProvider>
        </View>
      </ScrollView>

      <View className="px-5 pb-5">
        <Button
          type="primary"
          title={isImporting ? strings.buttonLoading : strings.buttonSubmit}
          onPress={onSubmit}
          disabled={isSubmitDisabled}
        />
      </View>
    </SafeAreaView>
  );
};
