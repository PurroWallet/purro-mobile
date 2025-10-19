import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { Alert, Platform, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheetHandle from '@/components/BottomSheetHandle';
import { Icon } from '@/components/Icon';
import { useBottomSheetAnimationConfigs } from '@/core/hooks/useBottomSheetAnimationConfigs';
import { useTranslation } from '@/utils/i18n';

interface SettingsBottomSheetProps {
  onClose: () => void;
}

export interface SettingsBottomSheetRef {
  present: () => void;
  dismiss: () => void;
}

interface SettingOption {
  id: string;
  title: string;
  icon: string;
  type: 'toggle' | 'action';
  value?: boolean;
  action?: () => void;
}

const SettingsBottomSheet = forwardRef<SettingsBottomSheetRef, SettingsBottomSheetProps>(
  ({ onClose }, ref) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const bottomSheetRef = useRef<BottomSheetModalMethods>(null);
    const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
    const [biometricEnabled, setBiometricEnabled] = React.useState(false);
    const [darkMode, setDarkMode] = React.useState(true);

    // Custom animation configs
    const animationConfigs = useBottomSheetAnimationConfigs();

    // Custom backdrop
    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior="close"
        />
      ),
      [],
    );

    // Custom handle
    const renderHandle = useCallback((props: any) => <BottomSheetHandle {...props} />, []);

    useImperativeHandle(ref, () => ({
      present: () => bottomSheetRef.current?.present(),
      dismiss: () => bottomSheetRef.current?.dismiss(),
    }));

    const handleChangePassword = () => {
      Alert.alert(
        t('settings.changePassword'),
        'Change password functionality will be implemented in the next phase',
        [{ text: t('common.ok') }],
      );
    };

    const handleExportWallet = () => {
      Alert.alert(
        t('settings.exportWallet'),
        'Export wallet functionality will be implemented in the next phase',
        [{ text: t('common.ok') }],
      );
    };

    const handleAbout = () => {
      Alert.alert(
        t('settings.about'),
        'About functionality will be implemented in the next phase',
        [{ text: t('common.ok') }],
      );
    };

    const handleHelp = () => {
      Alert.alert(t('settings.help'), 'Help functionality will be implemented in the next phase', [
        { text: t('common.ok') },
      ]);
    };

    const settingOptions: SettingOption[] = [
      {
        id: 'notifications',
        title: t('settings.notifications'),
        icon: 'Bell',
        type: 'toggle',
        value: notificationsEnabled,
        action: () => setNotificationsEnabled(!notificationsEnabled),
      },
      {
        id: 'biometric',
        title: t('settings.biometric'),
        icon: 'Fingerprint',
        type: 'toggle',
        value: biometricEnabled,
        action: () => setBiometricEnabled(!biometricEnabled),
      },
      {
        id: 'dark-mode',
        title: t('settings.darkMode'),
        icon: 'Moon',
        type: 'toggle',
        value: darkMode,
        action: () => setDarkMode(!darkMode),
      },
      {
        id: 'change-password',
        title: t('settings.changePassword'),
        icon: 'Lock',
        type: 'action',
        action: handleChangePassword,
      },
      {
        id: 'export-wallet',
        title: t('settings.exportWallet'),
        icon: 'Download',
        type: 'action',
        action: handleExportWallet,
      },
      {
        id: 'about',
        title: t('settings.about'),
        icon: 'Info',
        type: 'action',
        action: handleAbout,
      },
      {
        id: 'help',
        title: t('settings.help'),
        icon: 'HelpCircle',
        type: 'action',
        action: handleHelp,
      },
    ];

    const renderSettingOption = (option: SettingOption) => (
      <TouchableOpacity
        key={option.id}
        className="flex-row items-center justify-between rounded-xl bg-background-secondary/60 px-4 py-4"
        onPress={option.action}
        activeOpacity={0.8}
        disabled={option.type === 'toggle'}
      >
        <View className="flex-1 flex-row items-center gap-3.5">
          <Icon name={option.icon} size={24} color="rgb(var(--color-text-secondary))" />
          <Text className="text-lg font-normal text-text-primary">{option.title}</Text>
        </View>
        {option.type === 'toggle' ? (
          <Switch
            value={option.value}
            onValueChange={option.action}
            trackColor={{ false: '#3F434D', true: '#059288' }}
            thumbColor={option.value ? '#FFFFFF' : '#FFFFFF'}
            ios_backgroundColor="#3F434D"
          />
        ) : (
          <Icon name="ChevronRight" size={16} color="rgb(var(--color-text-secondary))" />
        )}
      </TouchableOpacity>
    );

    const renderHeader = () => (
      <View
        className="flex-row items-center justify-between border-b border-[#373B43] px-5"
        style={{ paddingBottom: insets.bottom + 16, paddingTop: 24 }}
      >
        <TouchableOpacity
          className="h-6 w-6 items-center justify-center"
          onPress={() => {
            bottomSheetRef.current?.dismiss();
            onClose();
          }}
        >
          <Icon name="Close" size={24} color="rgb(var(--color-text-primary))" />
        </TouchableOpacity>
        <Text className="text-center text-lg font-medium text-text-primary">
          {t('settings.title')}
        </Text>
        <View className="h-6 w-6" />
      </View>
    );

    return (
      <>
        <BottomSheetModal
          ref={bottomSheetRef}
          index={0}
          snapPoints={['70%']}
          animationConfigs={animationConfigs}
          stackBehavior="replace"
          onChange={(index: number) => {
            if (index === -1) {
              onClose();
            }
          }}
          backgroundStyle={{
            backgroundColor: '#161616',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
          handleComponent={renderHandle}
          backdropComponent={renderBackdrop}
          enablePanDownToClose={true}
          keyboardBehavior={Platform.OS === 'ios' ? 'interactive' : undefined}
          keyboardBlurBehavior="restore"
          android_keyboardInputMode={Platform.OS === 'android' ? 'adjustResize' : undefined}
        >
          <BottomSheetView className="flex-1 px-5">
            {renderHeader()}
            <View className="pt-5 gap-2">{settingOptions.map(renderSettingOption)}</View>
          </BottomSheetView>
        </BottomSheetModal>
      </>
    );
  },
);

export default SettingsBottomSheet;
