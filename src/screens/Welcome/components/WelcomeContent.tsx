import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components';
import { Icon } from '@/components/Icon';
import type { WelcomeStrings } from '../hooks/useWelcomeScreen';

interface WelcomeContentProps {
  strings: WelcomeStrings;
  acceptedTerms: boolean;
  loadingProvider: string | null;
  onToggleTerms: () => void;
  onCreateWallet: () => void;
  onImportWallet: () => void;
  onSocialLogin: () => void;
  onViewTerms: () => void;
  onViewPrivacy: () => void;
}

export const WelcomeContent: React.FC<WelcomeContentProps> = ({
  strings,
  acceptedTerms,
  loadingProvider,
  onToggleTerms,
  onCreateWallet,
  onImportWallet,
  onSocialLogin,
  onViewTerms,
  onViewPrivacy,
}) => {
  const isActionDisabled = !acceptedTerms;
  const isSocialDisabled = !acceptedTerms || loadingProvider !== null;

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="flex-1 items-center justify-center px-5">
        <View className="mb-8">
          <View className="h-[120px] w-[120px] items-center justify-center rounded-full bg-background-secondary">
            <Icon name="RabbyLogo" size={60} />
          </View>
        </View>

        <View className="items-center gap-4">
          <Text className="w-[335px] text-center text-h4 text-text-primary">{strings.title}</Text>
          <Text className="w-[335px] text-center text-button text-text-secondary">
            {strings.subtitle}
          </Text>
        </View>
      </View>

      <View className="gap-5 px-5 pb-5">
        <View className="items-center gap-2">
          <Pressable className="flex-row items-center gap-2" onPress={onToggleTerms}>
            <View
              className={`h-4 w-4 items-center justify-center rounded border border-text-secondary ${acceptedTerms ? 'border-brand-primary bg-brand-primary' : 'bg-transparent'}`}
            >
              {acceptedTerms && (
                <View className="h-[6px] w-[8px] -rotate-45 border-b-[1.5px] border-l-[1.5px] border-system-white -mt-[2px] ml-[1px]" />
              )}
            </View>
            <Text className="text-label text-text-secondary">{strings.termsText}</Text>
          </Pressable>

          <View className="flex-row items-center gap-2">
            <Pressable onPress={onViewTerms}>
              <Text className="text-xs text-brand-primary underline">Terms of Service</Text>
            </Pressable>
            <Text className="text-xs text-text-secondary">•</Text>
            <Pressable onPress={onViewPrivacy}>
              <Text className="text-xs text-brand-primary underline">Privacy Policy</Text>
            </Pressable>
          </View>
        </View>

        <View className="mt-4">
          {loadingProvider && (
            <View className="mb-3 items-center">
              <View className="flex-row items-center gap-2">
                <ActivityIndicator size="small" className="text-brand-primary" />
                <Text className="text-sm text-text-secondary">
                  Connecting to {loadingProvider}...
                </Text>
              </View>
            </View>
          )}

          <View className="w-full">
            <Button
              type="secondary"
              title={strings.googleCta}
              onPress={onSocialLogin}
              disabled={isSocialDisabled}
              className="w-full"
            />
          </View>
        </View>

        <View className="flex-row items-center w-full gap-x-2">
          <View className="flex-1 h-[1px] bg-gray-500" />
          <Text className="mx-2 text-base text-gray-500 uppercase">or</Text>
          <View className="flex-1 h-[1px] bg-gray-500" />
        </View>

        <Button
          type="primary"
          title={strings.createWallet}
          onPress={onCreateWallet}
          disabled={isActionDisabled}
        />

        <Button
          type="secondary"
          title={strings.importWallet}
          onPress={onImportWallet}
          disabled={isActionDisabled}
        />
      </View>
    </SafeAreaView>
  );
};
