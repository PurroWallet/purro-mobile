import { BottomSheetView } from '@gorhom/bottom-sheet';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { walletController } from '@/core/controllers/WalletController';
import { useTranslation } from '@/utils/i18n';
import type { AccountStackParamList } from '../AccountStackNavigator';
import SheetHeader from '../components/SheetHeader';

type Props = NativeStackScreenProps<AccountStackParamList, 'EditAccountName'>;

const EditAccountNameScreen: React.FC<Props> = ({ navigation, route }) => {
  const { accountAddress, currentName } = route.params;
  const [name, setName] = useState(currentName);
  const { t } = useTranslation();

  const handleSave = async () => {
    try {
      walletController.updateAccountAlias(accountAddress, name);
      navigation.goBack();
    } catch (error) {
      console.error('Failed to update account name:', error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <BottomSheetView className="flex-1">
        {/* Header */}
        <SheetHeader
          title={t('accountBottomSheet.accountName')}
          onBack={() => navigation.goBack()}
        />

        {/* Input Field */}
        <View className="px-5 pt-5">
          <View className="gap-2.5">
            <View className="rounded-xl border border-[#494F5B] px-4 py-4">
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={t('accountBottomSheet.editNamePlaceholder')}
                placeholderTextColor="#8D94A3"
                className="text-lg text-[#F9F9F9]"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
            </View>
          </View>
        </View>

        {/* Save Button (optional, can use keyboard done) */}
        <View className="absolute bottom-10 w-full px-6">
          <TouchableOpacity onPress={handleSave} className="rounded-xl bg-[#059288] px-6 py-4">
            <Text className="text-center text-lg font-medium text-[#F9F9F9]">
              {t('common.save')}
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </TouchableWithoutFeedback>
  );
};

export default EditAccountNameScreen;
