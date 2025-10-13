import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { z } from 'zod';
import { useZodForm, ZodFormValues } from '@/hooks/form/useZodForm';
import { apisWallet } from '@/core/apis';

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
  onSuccess: () => void;
}

export const useCreatePasswordForm = ({
  mnemonic,
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
          await apisWallet.importWallet(mnemonic, values.password);
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
      [isCreating, mnemonic, onSuccess],
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
