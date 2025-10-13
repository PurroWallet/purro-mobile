import type { FC } from 'react';
import { useEffect } from 'react';
import { StatusBar, Text, TouchableOpacity, View } from 'react-native';
import * as bip39 from '@scure/bip39';
import { HDKey } from '@scure/bip32';
import { FormProvider } from 'react-hook-form';
import { PasswordInputForm } from '@/components';
import KeyboardAvoidingView from '@/components/KeyboardAvoidingView';
import { apisLock } from '@/core/apis';
import { useCreatePasswordForm } from '@/hooks/form/useCreatePasswordForm';
import { useProtectedScreen } from '@/hooks/security';
import { useTranslation } from '@/utils/i18n';
import type { CreatePasswordScreenProps } from '@/types/navigation';

// Progress Indicator Component
const ProgressIndicator = () => (
  <View className="mt-5 w-[240px]">
    <View className="h-[3px] flex-row gap-1 rounded-full">
      <View className="h-[3px] flex-1 rounded-full bg-brand-primary" />
      <View className="h-[3px] flex-1 rounded-full bg-brand-primary" />
      <View className="h-[3px] flex-1 rounded-full bg-brand-primary" />
      <View className="h-[3px] flex-1 rounded-full bg-background-tertiary" />
    </View>
  </View>
);

const CreatePasswordScreen: FC<CreatePasswordScreenProps> = ({
  route,
  navigation,
}) => {
  useTranslation();
  const { mnemonic } = route.params;

  const { form, handleSubmit, isCreating, isValid } = useCreatePasswordForm({
    mnemonic,
    onSuccess: () => navigation.navigate('WalletSuccess'),
  });

  const { setFocus } = form;

  const passwordValue = form.watch('password') ?? '';

  // Enable screenshot prevention for this screen
  useProtectedScreen('CreateWallet');

  // Pre-warm vault và HD operations ngay khi component mount
  useEffect(() => {
    const preWarmOperations = async () => {
      try {
        // Pre-warm vault
        await apisLock.unlockWallet('');
      } catch (e) {
        // Expected to fail, but vault is now warmed up
      }

      try {
        // Pre-warm HD operations bằng cách tạo dummy HD key
        const dummyMnemonic =
          'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
        const seed = bip39.mnemonicToSeedSync(dummyMnemonic);
        HDKey.fromMasterSeed(seed);
        console.log('✅ HD operations pre-warmed');
      } catch (e) {
        // Ignore errors, just for warming up
      }
    };

    preWarmOperations();
  }, []);

  return (
    <KeyboardAvoidingView>
      <StatusBar barStyle="light-content" backgroundColor="#161616" />

      <View className="flex-1 items-center justify-between px-5 pb-10 pt-5">
        <ProgressIndicator />

        <View className="items-center gap-4">
          <Text className="w-[335px] text-h4 text-text-primary">
            Create password
          </Text>
          <Text className="w-[335px] text-center text-button text-text-secondary">
            Your Gateway to Hyperliquid
          </Text>
        </View>

        <FormProvider {...form}>
          <View className="w-full gap-4">
            <PasswordInputForm
              name="password"
              label="Password"
              placeholder="Enter password"
              autoCapitalize="none"
              textContentType="password"
              helperText={passwordValue.length === 0 ? 'Minimum 8 characters' : undefined}
              returnKeyType="next"
              onSubmitEditing={() => setFocus('confirmPassword')}
            />

            <PasswordInputForm
              name="confirmPassword"
              label="Confirm password"
              placeholder="Confirm password"
              autoCapitalize="none"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={() => void handleSubmit()}
            />
          </View>
        </FormProvider>
      </View>

      <View className="px-5 pb-5">
        <TouchableOpacity
          className={`w-full min-h-12 items-center justify-center rounded-xl px-6 py-4 ${
            !isValid || isCreating ? 'bg-button-primary-disabled' : 'bg-brand-primary'
          }`}
          onPress={() => void handleSubmit()}
          disabled={!isValid || isCreating}
        >
          <Text
            className={`text-button ${
              !isValid || isCreating
                ? 'text-button-primary-disabled-text'
                : 'text-button-primary-text'
            }`}
          >
            {isCreating ? 'Creating Wallet...' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default CreatePasswordScreen;
