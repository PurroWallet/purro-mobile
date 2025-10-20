import { BottomSheetView } from '@gorhom/bottom-sheet';
import Clipboard from '@react-native-clipboard/clipboard';
import { useColorScheme } from 'nativewind';
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Alert, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BaseBottomSheet, { type BaseBottomSheetRef } from '@/components/BaseBottomSheet';
import { Icon } from '@/components/Icon';
import ThemeToggle from '@/components/ThemeToggle';
import { walletController } from '@/core/controllers/WalletController';
import { useTranslation } from '@/utils/i18n';

interface Account {
  address: string;
  type: string;
  brandName: string;
  alianName?: string;
}

interface EditAccountBottomSheetProps {
  onClose: () => void;
  account: Account | null;
}

export interface EditAccountBottomSheetRef {
  present: () => void;
  dismiss: () => void;
}

interface EditOption {
  id: string;
  title: string;
  value?: string;
  icon: string;
  action: () => void;
}

interface SettingOption {
  id: string;
  title: string;
  icon: string;
  type: 'toggle' | 'action';
  value?: boolean;
  action?: () => void;
  rightComponent?: React.ReactNode;
}

const EditAccountBottomSheet = forwardRef<EditAccountBottomSheetRef, EditAccountBottomSheetProps>(
  ({ onClose, account }, ref) => {
    const { t } = useTranslation();
    const { colorScheme } = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const insets = useSafeAreaInsets();
    const bottomSheetRef = useRef<BaseBottomSheetRef>(null);
    const [editingAlias, setEditingAlias] = useState(false);
    const [aliasText, setAliasText] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [biometricEnabled, setBiometricEnabled] = useState(false);

    useImperativeHandle(ref, () => ({
      present: () => {
        setAliasText(account?.alianName || '');
        bottomSheetRef.current?.present();
      },
      dismiss: () => {
        bottomSheetRef.current?.dismiss();
        setEditingAlias(false);
      },
    }));

    const handleSaveAlias = async () => {
      if (!account) return;

      try {
        await walletController.updateAccountAlias(account.address, aliasText);
        setEditingAlias(false);
        bottomSheetRef.current?.dismiss();
        onClose();
      } catch (error) {
        console.error('Failed to update alias:', error);
        Alert.alert(t('common.error'), t('accountBottomSheet.aliasUpdateFailed'));
      }
    };

    const handleShowPrivateKey = async () => {
      if (!account) return;

      try {
        // Get private key (this is a placeholder - actual implementation will depend on wallet architecture)
        Alert.alert(
          t('accountBottomSheet.showPrivateKey'),
          'Private key functionality will be implemented in the next phase',
          [{ text: t('common.ok') }],
        );

        // When implemented, this would:
        // 1. Get private key from walletController
        // 2. Show it in a secure modal
        // 3. Provide option to copy
      } catch (error) {
        console.error('Failed to retrieve private key:', error);
        Alert.alert(t('common.error'), 'Failed to retrieve private key');
      }
    };

    const handleShowSeedPhrase = async () => {
      if (!account) return;

      try {
        // Get seed phrase (this is a placeholder - actual implementation will depend on wallet architecture)
        Alert.alert(
          t('accountBottomSheet.seedPhrase'),
          'Seed phrase functionality will be implemented in the next phase',
          [{ text: t('common.ok') }],
        );

        // When implemented, this would:
        // 1. Get seed phrase from walletController
        // 2. Show it in a secure modal
        // 3. Provide option to copy
      } catch (error) {
        console.error('Failed to retrieve seed phrase:', error);
        Alert.alert(t('common.error'), 'Failed to retrieve seed phrase');
      }
    };

    const handleDeleteAccount = () => {
      if (!account) return;

      Alert.alert(
        t('accountBottomSheet.deleteAccount'),
        'Are you sure you want to delete this account? This action cannot be undone.',
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('accountBottomSheet.deleteAccount'),
            style: 'destructive',
            onPress: async () => {
              try {
                // Delete account functionality will be implemented
                Alert.alert(
                  t('common.error'),
                  'Delete account functionality will be implemented in the next phase',
                );

                // When implemented, this would:
                // 1. Call walletController.deleteAccount(account.address)
                // 2. Handle the case when deleting the current account
                // 3. Refresh the account list

                // bottomSheetRef.current?.dismiss();
                // onClose();
              } catch (error) {
                console.error('Failed to delete account:', error);
                Alert.alert(t('common.error'), 'Failed to delete account');
              }
            },
          },
        ],
      );
    };

    const renderSettingsContent = () => {
      const settingOptions = [
        {
          id: 'notifications',
          title: t('settings.notifications'),
          icon: 'Bell',
          type: 'toggle' as const,
          value: notificationsEnabled,
          action: () => setNotificationsEnabled(!notificationsEnabled),
        },
        {
          id: 'biometric',
          title: t('settings.biometric'),
          icon: 'Fingerprint',
          type: 'toggle' as const,
          value: biometricEnabled,
          action: () => setBiometricEnabled(!biometricEnabled),
        },
        {
          id: 'dark-mode',
          title: t('settings.darkMode'),
          icon: 'Moon',
          type: 'toggle' as const,
          value: isDarkMode,
          action: () => {
            // Sẽ sử dụng ThemeToggle component thay vì action trực tiếp
          },
          rightComponent: <ThemeToggle />,
        },
        {
          id: 'change-password',
          title: t('settings.changePassword'),
          icon: 'Lock',
          type: 'action' as const,
          action: () => Alert.alert(t('settings.changePassword'), 'Coming soon'),
        },
        {
          id: 'export-wallet',
          title: t('settings.exportWallet'),
          icon: 'Download',
          type: 'action' as const,
          action: () => Alert.alert(t('settings.exportWallet'), 'Coming soon'),
        },
        {
          id: 'about',
          title: t('settings.about'),
          icon: 'Info',
          type: 'action' as const,
          action: () => Alert.alert(t('settings.about'), 'Coming soon'),
        },
        {
          id: 'help',
          title: t('settings.help'),
          icon: 'HelpCircle',
          type: 'action' as const,
          action: () => Alert.alert(t('settings.help'), 'Coming soon'),
        },
      ];

      const renderSettingOption = (option: SettingOption) => (
        <TouchableOpacity
          key={option.id}
          className="flex-row items-center bg-background-secondary rounded-xl p-4 justify-between mb-2"
          onPress={option.action}
          activeOpacity={0.8}
          disabled={option.type === 'toggle'}
        >
          <View className="flex-row items-center gap-3.5 flex-1">
            <Icon name={option.icon} size={24} color="rgb(var(--color-text-secondary))" />
            <Text className="text-lg font-normal text-text-primary">{option.title}</Text>
          </View>
          {option.rightComponent ||
            (option.type === 'toggle' ? (
              <Switch
                value={option.value}
                onValueChange={option.action}
                trackColor={{ false: '#3F434D', true: '#007AFF' }}
                thumbColor={option.value ? '#FFFFFF' : '#FFFFFF'}
                ios_backgroundColor="#3F434D"
              />
            ) : (
              <Icon name="ChevronRight" size={16} color="rgb(var(--color-text-secondary))" />
            ))}
        </TouchableOpacity>
      );

      return (
        <View className="flex-1 w-full">
          <View className="w-full pt-5 gap-2">{settingOptions.map(renderSettingOption)}</View>
        </View>
      );
    };

    const handleCopyAddress = () => {
      if (!account) return;

      Clipboard.setString(account.address);
      Alert.alert(t('common.success'), 'Address copied to clipboard');
    };

    const editOptions: EditOption[] = [
      {
        id: 'account-name',
        title: t('accountBottomSheet.accountName'),
        value: account?.alianName || 'dict',
        icon: editingAlias ? 'Close' : 'Edit',
        action: () => setEditingAlias(!editingAlias),
      },
      {
        id: 'copy-address',
        title: 'Copy Address',
        value: account?.address,
        icon: 'Copy',
        action: handleCopyAddress,
      },
      {
        id: 'show-private-key',
        title: t('accountBottomSheet.showPrivateKey'),
        icon: 'Eye',
        action: handleShowPrivateKey,
      },
      {
        id: 'seed-phrase',
        title: t('accountBottomSheet.seedPhrase'),
        value: 'Seed phrase 2',
        icon: 'Eye',
        action: handleShowSeedPhrase,
      },
    ];

    const renderEditOption = (option: EditOption) => (
      <TouchableOpacity
        key={option.id}
        className="flex-row items-center justify-between bg-background-secondary rounded-xl p-4 border-2 border-background-primary"
        onPress={option.action}
        activeOpacity={0.8}
      >
        <View className="flex-1 gap-2">
          <Text className="text-lg font-normal text-text-primary">{option.title}</Text>
          {option.value && !editingAlias && (
            <Text className="text-lg font-normal text-text-tertiary">{option.value}</Text>
          )}
          {option.id === 'account-name' && editingAlias && (
            <TextInput
              className="text-lg font-normal text-text-tertiary border-b border-text-primary pb-1"
              value={aliasText}
              onChangeText={setAliasText}
              onSubmitEditing={handleSaveAlias}
              autoFocus
              multiline={false}
            />
          )}
        </View>
        <Icon name={option.icon} size={20} color="rgb(var(--color-text-primary))" />
      </TouchableOpacity>
    );

    const renderHeader = () => (
      <View
        className="flex-row items-center justify-between pt-6 pb-4 w-full"
        style={{ paddingBottom: insets.bottom + 16, backgroundColor: '#373B43' }}
      >
        <TouchableOpacity
          className="w-6 h-6 items-center justify-center"
          onPress={() => {
            if (showSettings) {
              setShowSettings(false);
            } else {
              bottomSheetRef.current?.dismiss();
              onClose();
            }
          }}
        >
          <Icon name="Close" size={24} color="rgb(var(--color-text-primary))" />
        </TouchableOpacity>
        <Text className="text-xl font-medium text-text-primary absolute left-0 right-0 text-center">
          {showSettings ? t('settings.title') : t('accountBottomSheet.editAccount')}
        </Text>
        <TouchableOpacity
          className="w-6 h-6 items-center justify-center"
          onPress={() => setShowSettings(!showSettings)}
        >
          <Icon
            name={showSettings ? 'Close' : 'Settings'}
            size={24}
            color={
              showSettings ? 'rgb(var(--color-text-primary))' : 'rgb(var(--color-brand-primary))'
            }
          />
        </TouchableOpacity>
      </View>
    );

    const renderAvatar = () => (
      <View className="mt-6 mb-8 relative">
        <View className="w-30 h-30 rounded-full bg-background-secondary border border-border-primary items-center justify-center">
          <Text className="text-5xl font-semibold text-text-primary">
            {(account?.alianName || 'Account').charAt(0).toUpperCase()}
          </Text>
        </View>
        <TouchableOpacity className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-background-secondary items-center justify-center border border-background-primary">
          <Icon name="Camera" size={20} color="rgb(var(--color-text-primary))" />
        </TouchableOpacity>
      </View>
    );

    const renderDeleteButton = () => (
      <TouchableOpacity
        className="flex-row items-center justify-center gap-3.5 py-4 px-6 mt-auto mb-5"
        onPress={handleDeleteAccount}
        activeOpacity={0.8}
      >
        <Icon name="Trash" size={20} color="rgb(var(--color-system-error))" />
        <Text className="text-lg font-normal text-red-400">
          {t('accountBottomSheet.deleteAccount')}
        </Text>
      </TouchableOpacity>
    );

    return (
      <BaseBottomSheet
        ref={bottomSheetRef}
        onClose={onClose}
        snapPoints={['80%']}
        enableHandle={true}
        stackBehavior="push"
      >
        <BottomSheetView className="flex-1 px-5 items-center">
          {renderHeader()}
          {showSettings ? (
            renderSettingsContent()
          ) : (
            <>
              {renderAvatar()}
              <View className="w-full gap-4 mb-8">{editOptions.map(renderEditOption)}</View>
              {renderDeleteButton()}
            </>
          )}
        </BottomSheetView>
      </BaseBottomSheet>
    );
  },
);

export default EditAccountBottomSheet;
