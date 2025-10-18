import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { walletController } from '@/core/controllers/WalletController';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AccountStackParamList } from '../AccountStackNavigator';
import SheetHeader from '../components/SheetHeader';

type Props = NativeStackScreenProps<AccountStackParamList, 'EditAccountName'>;

const EditAccountNameScreen: React.FC<Props> = ({ navigation, route }) => {
  const { accountAddress, currentName } = route.params;
  const [name, setName] = useState(currentName);

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
        <SheetHeader title="Account Name" onBack={() => navigation.goBack()} />

        {/* Input Field */}
        <View className="px-5 pt-5">
          <View className="gap-2.5">
            <View className="rounded-xl border border-[#494F5B] px-4 py-4">
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter account name"
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
          <TouchableOpacity
            onPress={handleSave}
            className="rounded-xl bg-[#059288] px-6 py-4"
          >
            <Text className="text-center text-lg font-medium text-[#F9F9F9]">
              Save
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </TouchableWithoutFeedback>
  );
};

export default EditAccountNameScreen;
