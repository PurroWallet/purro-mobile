import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AccountStackParamList } from '../AccountStackNavigator';
import type { NavigationProp } from '@react-navigation/native';
import SheetHeader from '../components/SheetHeader';
import { Icon } from '@/components/Icon';
import { useTranslation } from '@/utils/i18n';

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
    <BottomSheetScrollView className="flex-1 bg-[#161616]">
      {/* Header */}
      <SheetHeader
        title={t('accountBottomSheet.addAccount')}
        onBack={handleBack}
      />
      <View className="mb-6" />

      {/* Options List */}
      <View className="px-5 pt-5">
        <View className="gap-2">
          {options.map(option => (
            <TouchableOpacity
              key={option.id}
              onPress={option.action}
              className="flex-row items-center gap-3.5 rounded-xl bg-[#25272C]/60 px-4 py-4"
            >
              <View className="h-9 w-9 items-center justify-center rounded-full bg-[#3F434D]">
                <Icon name={option.icon} size={24} color="#F9F9F9" />
              </View>
              <View className="flex-1">
                <Text className="text-lg text-[#F9F9F9]">{t(option.title)}</Text>
                <Text className="text-sm text-[#8D94A3]">
                  {t(option.subtitle)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </BottomSheetScrollView>
  );
};

export default AddAccountScreen;
