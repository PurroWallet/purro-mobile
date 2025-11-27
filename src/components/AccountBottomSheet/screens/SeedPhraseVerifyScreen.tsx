import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Alert, Text, View } from 'react-native';
import { Button, FormInput } from '@/components';
import { useTranslation } from '@/utils/i18n';
import type { AccountStackParamList } from '../AccountStackNavigator';
import BaseScreen from '../components/BaseScreen';

type Props = {
  onClose: () => void;
};

const SeedPhraseVerifyScreen: React.FC<Props> = ({ onClose }) => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<AccountStackParamList, 'SeedPhraseVerify'>>();
  const { mnemonic } = route.params;
  const { t } = useTranslation();

  const words = mnemonic.split(' ');
  const [verificationFields] = React.useState(() => {
    const positions = [0, 3, 8]; // Verify 1st, 4th, 9th words
    return positions.map((position) => ({
      position,
      name: `word_${position}`,
      correctWord: words[position],
    }));
  });

  const form = useForm<{ [key: string]: string }>({
    defaultValues: verificationFields.reduce((acc: { [key: string]: string }, field) => {
      acc[field.name] = '';
      return acc;
    }, {}),
    mode: 'onChange',
  });

  const formValues = form.watch();
  const canContinue = verificationFields.every((field) => {
    const value = formValues[field.name];
    return value?.trim().length;
  });

  const onSubmit = (values: Record<string, string>) => {
    const isValid = verificationFields.every((field) => {
      const inputWord = values[field.name]?.toLowerCase().trim();
      return inputWord === field.correctWord;
    });

    if (!isValid) {
      Alert.alert('Incorrect seed phrase', 'Please try again.');
      form.reset();
      return;
    }

    // Navigate to password verification (not create password)
    navigation.navigate('PasswordVerification', {
      accountAddress: '',
      onSuccess: async (verifiedPassword: string) => {
        try {
          // Create the HD wallet with the verified password and mnemonic
          const { walletController } = await import('@/core/controllers/WalletController');
          await walletController.bootForNewWallet(verifiedPassword);
          const addresses = await walletController.importWalletWithMnemonic(
            mnemonic,
            verifiedPassword,
          );

          // Navigate to success screen
          navigation.navigate('Success', {
            title: 'Wallet Created!',
            message: 'Your seed phrase wallet has been created successfully.',
            buttonText: 'Done',
          });
        } catch (error) {
          Alert.alert('Error', 'Failed to create wallet. Please try again.');
        }
      },
    });
  };

  const handleContinue = () => {
    form.handleSubmit(onSubmit)();
  };

  const handleBackPress = () => {
    onClose();
  };

  const renderFooter = () => (
    <Button
      type="primary"
      title={t('seedPhrase.verify.actions.continue')}
      onPress={handleContinue}
      disabled={!canContinue}
    />
  );

  return (
    <BaseScreen
      title={t('seedPhrase.verify.title')}
      showBackButton={true}
      onBack={handleBackPress}
      isScrollable={true}
      footer={renderFooter()}
    >
      <View className="px-4">
        {/* Progress Indicator */}
        <View className="items-center mb-8">
          <View className="h-1 w-16 rounded-full bg-brand-primary" />
          <View className="mt-2 h-1 w-16 rounded-full bg-border" />
        </View>

        {/* Subtitle */}
        <View className="mb-8">
          <Text className="text-center text-button text-text-secondary">
            {t('seedPhrase.verify.subtitle')}
          </Text>
        </View>

        {/* Verification Fields */}
        <FormProvider {...form}>
          <View className="w-full gap-6">
            {verificationFields.map((field, index) => (
              <FormInput
                key={field.name}
                name={field.name}
                label={t('seedPhrase.verify.wordLabel', { number: field.position + 1 })}
                placeholder={`Enter word ${field.position + 1}`}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType={index === verificationFields.length - 1 ? 'done' : 'next'}
                onSubmitEditing={
                  index === verificationFields.length - 1 ? handleContinue : undefined
                }
              />
            ))}
          </View>
        </FormProvider>
      </View>
    </BaseScreen>
  );
};

SeedPhraseVerifyScreen.displayName = 'SeedPhraseVerifyScreen';

export default SeedPhraseVerifyScreen;
