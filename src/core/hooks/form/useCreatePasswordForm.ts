import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { z } from 'zod';
import { apisWallet } from '@/core/apis';
import { useZodForm, ZodFormValues } from '@/core/hooks/form/useZodForm';

const createPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm password must be at least 8 characters'),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Passwords do not match',
      });
    }
  });

export type CreatePasswordFormValues = ZodFormValues<typeof createPasswordSchema>;

interface UseCreatePasswordFormParams {
  mnemonic: string;
  isPrivateKeyImport?: boolean;
  onSuccess: () => void;
}

export const useCreatePasswordForm = ({
  mnemonic,
  isPrivateKeyImport = false,
  onSuccess,
}: UseCreatePasswordFormParams) => {
  const form = useZodForm(createPasswordSchema, {
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = form.handleSubmit(
    useCallback(
      async (values: CreatePasswordFormValues) => {
        if (isCreating) return;
        setIsCreating(true);

        try {
          console.time('🏗️ Total Create Wallet');

          // Check if this is a private key import
          if (isPrivateKeyImport && mnemonic.startsWith('PRIVATE_KEY:')) {
            // Extract private key and address from synthetic mnemonic
            const [, _privateKey, _address] = mnemonic.split(':');

            // Create wallet from private key
            console.log('🔑 Importing private key wallet:', _address);

            // Store the private key in a secure location (this would need proper implementation)
            // For now, we'll just log it
            console.log('🔐 Storing private key for address:', _address);

            // Create a simple wallet record for the private key
            // In a real implementation, you would store this securely
            await apisWallet.importPrivateKey(_privateKey);
          } else {
            // Regular mnemonic import
            await apisWallet.importWallet(mnemonic, values.password);
          }
          console.timeEnd('🏗️ Total Create Wallet');
          onSuccess();
        } catch (error) {
          console.error('Error creating wallet:', error);
          Alert.alert(
            'Error',
            error instanceof Error && error.message.includes('Native module')
              ? "Failed to create wallet. If you're using Chrome debugger, please disable it and restart the app."
              : error instanceof Error
                ? error.message
                : 'Failed to create wallet. Please try again.',
          );
        } finally {
          setIsCreating(false);
        }
      },
      [isCreating, mnemonic, onSuccess, isPrivateKeyImport],
    ),
  );

  const isValid = form.formState.isValid;

  return {
    form,
    handleSubmit,
    isCreating,
    isValid,
  };
};
