import { BottomSheetView } from '@gorhom/bottom-sheet';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Keyboard, Text, TouchableWithoutFeedback, View } from 'react-native';
import { Button, FormInput } from '@/components';
import { walletController } from '@/core/controllers/WalletController';
import { useTranslation } from '@/utils/i18n';
import type { AccountStackParamList } from '../AccountStackNavigator';
import BaseScreen from '../components/BaseScreen';

const EditAccountNameScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AccountStackParamList, 'EditAccountName'>>();
  const route = useRoute<RouteProp<AccountStackParamList, 'EditAccountName'>>();
  const { accountAddress, currentName } = route.params;
  const { t } = useTranslation();

  const form = useForm({
    defaultValues: {
      name: currentName || '',
    },
  });

  const handleSave = async (data: { name: string }) => {
    try {
      walletController.updateAccountAlias(accountAddress, data.name);
      navigation.goBack();
    } catch (error) {
      console.error('Failed to update account name:', error);
    }
  };

  const renderFooter = () => (
    <View className="absolute bottom-10 w-full px-6">
      <Button
        type="primary"
        title={t('common.save')}
        onPress={form.handleSubmit(handleSave)}
        className="w-full"
      />
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <BaseScreen
        title={t('accountBottomSheet.accountName')}
        showBackButton={true}
        onBack={() => navigation.goBack()}
        footer={renderFooter()}
      >
        {/* Input Field */}
        <View className="px-5 pt-5">
          <FormProvider {...form}>
            <FormInput
              name="name"
              label={t('accountBottomSheet.accountName')}
              placeholder={t('accountBottomSheet.editNamePlaceholder')}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={form.handleSubmit(handleSave)}
            />
          </FormProvider>
        </View>
      </BaseScreen>
    </TouchableWithoutFeedback>
  );
};

export default EditAccountNameScreen;
