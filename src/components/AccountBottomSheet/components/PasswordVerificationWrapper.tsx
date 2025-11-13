import type { NavigationProp } from '@react-navigation/native';
import type { ReactNode } from 'react';
import React from 'react';
import { Alert } from 'react-native';
import { useTranslation } from '@/utils/i18n';

type Props = {
  children: (onSuccess: () => void) => ReactNode;
  onSuccess: (password: string) => void | Promise<void>;
  operation: 'backup_wallet' | 'export_private_key' | 'reset_wallet' | 'general';
  navigation: NavigationProp<any>;
};

/**
 * Reusable wrapper for password verification before sensitive operations
 *
 * @param children - Function that receives onSuccess callback and returns UI to render
 * @param onSuccess - Callback executed after successful password verification
 * @param operation - Type of operation for better error messages
 * @param navigation - Navigation object for PasswordVerification screen
 */
export const PasswordVerificationWrapper: React.FC<Props> = ({
  children,
  onSuccess,
  operation,
  navigation,
}) => {
  const { t } = useTranslation();

  const handleVerification = () => {
    navigation.navigate('PasswordVerification', {
      accountAddress: '',
      onSuccess: async (verifiedPassword: string) => {
        try {
          await onSuccess(verifiedPassword);
        } catch (error) {
          const errorMessage = getOperationErrorMessage(operation, t);
          Alert.alert(t('common.error'), errorMessage);
        }
      },
    });
  };

  const getOperationErrorMessage = (op: string, translateFn: any): string => {
    switch (op) {
      case 'backup_wallet':
        return (
          translateFn('accountBottomSheet.errors.backupWalletFailed') || 'Failed to backup wallet'
        );
      case 'export_private_key':
        return (
          translateFn('accountBottomSheet.errors.exportPrivateKeyFailed') ||
          'Failed to export private key'
        );
      case 'reset_wallet':
        return (
          translateFn('accountBottomSheet.settingsScreen.alerts.resetWallet.error') ||
          'Failed to reset wallet'
        );
      default:
        return translateFn('errors.generic.message') || 'An error occurred';
    }
  };

  return <>{children(handleVerification)}</>;
};
