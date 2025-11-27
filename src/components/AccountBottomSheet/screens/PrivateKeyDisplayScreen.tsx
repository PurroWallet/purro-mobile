import Clipboard from '@react-native-clipboard/clipboard';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '@/components';
import { useTranslation } from '@/utils/i18n';
import type { AccountStackParamList } from '../AccountStackNavigator';
import BaseScreen from '../components/BaseScreen';

type Props = {
  privateKey: string;
  accountAddress: string;
  navigation: NativeStackNavigationProp<AccountStackParamList, 'PrivateKeyDisplay'>;
};

const PrivateKeyDisplayScreen: React.FC<Props> = ({ privateKey, accountAddress, navigation }) => {
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const { t } = useTranslation();

  const handleCopyToClipboard = () => {
    Clipboard.setString(privateKey);
    Alert.alert(
      t('accountBottomSheet.alerts.copiedTitle'),
      t('accountBottomSheet.alerts.seedPhraseCopied'),
    );
    // Reset navigation to AccountList after copying
    navigation.reset({
      index: 0,
      routes: [{ name: 'AccountList' }],
    });
  };

  const handleReveal = () => {
    setIsRevealed(true);
  };

  const renderFooter = () => (
    <View className="absolute bottom-10 w-full px-6">
      <Button
        type="primary"
        title={t('accountBottomSheet.copyToClipboard')}
        onPress={handleCopyToClipboard}
        className="w-full"
      />
    </View>
  );

  return (
    <BaseScreen
      title={t('accountBottomSheet.showPrivateKey')}
      showBackButton={true}
      onBack={() => navigation.goBack()}
      footer={renderFooter()}
      isScrollable={true}
    >
      <View className="flex-1 px-5 py-6">
        <View className="flex-1 justify-center">
          <View className="mb-6 rounded-xl bg-[#373B43]/60 p-4">
            {!isRevealed ? (
              <TouchableOpacity onPress={handleReveal} className="items-center justify-center py-8">
                <Text className="text-lg text-[#059288] font-medium">
                  {t('accountBottomSheet.revealRecoveryPhrase').replace(
                    'recovery phrase',
                    'private key',
                  )}
                </Text>
              </TouchableOpacity>
            ) : (
              <View className="items-center">
                <Text className="text-base text-[#F9F9F9] leading-6 text-center font-mono">
                  {privateKey}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </BaseScreen>
  );
};

export default PrivateKeyDisplayScreen;
