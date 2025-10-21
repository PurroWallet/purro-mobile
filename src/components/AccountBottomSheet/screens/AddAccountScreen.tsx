import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import type { NavigationProp } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { useTranslation } from '@/utils/i18n';
import type { AccountStackParamList } from '../AccountStackNavigator';
import BaseScreen from '../components/BaseScreen';

type Props = NativeStackScreenProps<AccountStackParamList, 'AddAccount'> & {
  onClose: () => void;
  parentNavigation: NavigationProp<any>;
};

interface AccountOption {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  action: () => void;
}

const AddAccountScreen: React.FC<Props> = ({
  navigation,
  onClose: _onClose,
  parentNavigation: _parentNavigation,
}) => {
  const { t } = useTranslation();
  const { colorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const handleBack = () => {
    console.log('AddAccountScreen - Back button pressed via handleBack');
    console.log('AddAccountScreen - Navigation state:', navigation.getState());
    navigation.goBack();
  };

  const handleCreateNew = () => {
    console.log('AddAccountScreen - Creating new account, navigating to unlock screen');

    // Navigate to unlock screen for creating new account
    navigation.navigate('Unlock', {
      isNewAccount: true,
    });
  };

  const handleImportSeedPhrase = () => {
    console.log('AddAccountScreen - Import seed phrase, navigating to sheet screen');
    navigation.navigate('ImportSeedPhrase');
  };

  const handleImportPrivateKey = () => {
    console.log('AddAccountScreen - Import private key, navigating to sheet screen');
    navigation.navigate('ImportPrivateKey');
  };

  const options: AccountOption[] = [
    {
      id: 'create',
      title: 'accountBottomSheet.createNewAccount',
      subtitle: 'accountBottomSheet.createAccountDescription',
      icon: 'PlusCircle',
      action: handleCreateNew,
    },
    {
      id: 'import-seed',
      title: 'accountBottomSheet.importRecoveryPhrase',
      subtitle: 'accountBottomSheet.importRecoveryPhraseDescription',
      icon: 'FileText',
      action: handleImportSeedPhrase,
    },
    {
      id: 'import-key',
      title: 'accountBottomSheet.importPrivateKey',
      subtitle: 'accountBottomSheet.importPrivateKeyDescription',
      icon: 'Key',
      action: handleImportPrivateKey,
    },
  ];

  return (
    <BaseScreen
      title={t('accountBottomSheet.addAccount')}
      showBackButton={true}
      onBack={handleBack}
      isScrollable={true}
      contentContainerStyle={{
        paddingHorizontal: 20,
      }}
    >
      <BottomSheetScrollView
        style={{ width: '100%' }}
        contentContainerStyle={{
          paddingBottom: 20,
        }}
      >
        {/* Options List */}
        <View className="gap-2">
          {options.map((option) => (
            <TouchableOpacity
              key={option.id}
              onPress={option.action}
              className="flex-row items-center gap-3.5 rounded-xl bg-background-secondary/60 px-4 py-4"
            >
              <View className="h-9 w-9 items-center justify-center rounded-full bg-brand-secondary">
                <Icon name={option.icon} size={24} />
              </View>
              <View className="flex-1">
                <Text className="text-lg text-text-primary">{t(option.title)}</Text>
                <Text className="text-sm text-text-secondary">{t(option.subtitle)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheetScrollView>
    </BaseScreen>
  );
};

export default AddAccountScreen;
