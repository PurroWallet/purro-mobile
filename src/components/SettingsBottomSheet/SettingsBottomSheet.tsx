import React, { useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { useTranslation } from '@/utils/i18n';
import { Icon } from '@/components/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import BottomSheetHandle from '@/components/BottomSheetHandle';
import { useBottomSheetAnimationConfigs } from '@/hooks/useBottomSheetAnimationConfigs';
import { Platform } from 'react-native';

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

const SettingsBottomSheet = forwardRef<SettingsBottomSheetRef, SettingsBottomSheetProps>(({
  onClose,
}, ref) => {
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
    []
  );
  
  // Custom handle
  const renderHandle = useCallback(
    (props: any) => <BottomSheetHandle {...props} />,
    []
  );

  useImperativeHandle(ref, () => ({
    present: () => bottomSheetRef.current?.present(),
    dismiss: () => bottomSheetRef.current?.dismiss(),
  }));

  const handleChangePassword = () => {
    Alert.alert(
      t('settings.changePassword'),
      'Change password functionality will be implemented in the next phase',
      [{ text: t('common.ok') }]
    );
  };

  const handleExportWallet = () => {
    Alert.alert(
      t('settings.exportWallet'),
      'Export wallet functionality will be implemented in the next phase',
      [{ text: t('common.ok') }]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      t('settings.about'),
      'About functionality will be implemented in the next phase',
      [{ text: t('common.ok') }]
    );
  };

  const handleHelp = () => {
    Alert.alert(
      t('settings.help'),
      'Help functionality will be implemented in the next phase',
      [{ text: t('common.ok') }]
    );
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
      style={styles.optionContainer}
      onPress={option.action}
      activeOpacity={0.8}
      disabled={option.type === 'toggle'}
    >
      <View style={styles.optionContent}>
        <Icon name={option.icon} size={24} color="#8E8E93" />
        <Text style={styles.optionTitle}>{option.title}</Text>
      </View>
      {option.type === 'toggle' ? (
        <Switch
          value={option.value}
          onValueChange={option.action}
          trackColor={{ false: '#3F434D', true: '#007AFF' }}
          thumbColor={option.value ? '#FFFFFF' : '#FFFFFF'}
          ios_backgroundColor="#3F434D"
        />
      ) : (
        <Icon name="ChevronRight" size={16} color="#8E8E93" />
      )}
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={[styles.header, { paddingBottom: insets.bottom + 16 }]}>
      <TouchableOpacity style={styles.closeButton} onPress={() => { bottomSheetRef.current?.dismiss(); onClose(); }}>
        <Icon name="Close" size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <Text style={styles.title}>{t('settings.title')}</Text>
      <View style={styles.placeholder} />
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
        backgroundStyle={styles.background}
        handleComponent={renderHandle}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={true}
        keyboardBehavior={Platform.OS === 'ios' ? 'interactive' : undefined}
        keyboardBlurBehavior="restore"
        android_keyboardInputMode={Platform.OS === 'android' ? 'adjustResize' : undefined}
      >
        <BottomSheetView style={styles.content}>
          {renderHeader()}
          <View style={styles.optionsContainer}>
            {settingOptions.map(renderSettingOption)}
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
});

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#161616',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#373B43',
  },
  closeButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    color: '#F9F9F9',
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  placeholder: {
    width: 24,
    height: 24,
  },
  optionsContainer: {
    paddingTop: 20,
    gap: 8,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 39, 44, 0.6)',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'space-between',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: '#F9F9F9',
  },
});

export default SettingsBottomSheet;