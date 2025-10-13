import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { z } from 'zod';
import { useZodForm, ZodFormValues } from '@/hooks/form/useZodForm';
import { apisLock } from '@/core/apis';

const unlockSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export type UnlockFormValues = ZodFormValues<typeof unlockSchema>;

interface UseUnlockFormParams {
  onSuccess: () => void;
}

export const useUnlockForm = ({ onSuccess }: UseUnlockFormParams) => {
  const form = useZodForm(unlockSchema, {
    defaultValues: {
      password: '',
    },
    mode: 'onChange',
  });

  const [isUnlocking, setIsUnlocking] = useState(false);

  const handleSubmit = form.handleSubmit(
    useCallback(
      async ({ password }: UnlockFormValues) => {
        if (isUnlocking) return;
        if (!password.trim()) {
          form.setError('password', {
            message: 'Password is required',
            type: 'manual',
          });
          return;
        }

        setIsUnlocking(true);

        try {
          console.time('🔓 Total Unlock Time');
          const result = await apisLock.unlockWallet(password);

          if (result.success) {
            form.reset({ password: '' });
            onSuccess();
          } else {
            form.setError('password', {
              message: result.formFieldError || result.error || 'Invalid password',
            });
          }
        } catch (error) {
          console.error('❌ Password unlock error:', error);
          Alert.alert('Error', 'Something went wrong while unlocking');
        } finally {
          console.timeEnd('🔓 Total Unlock Time');
          setIsUnlocking(false);
        }
      },
      [form, isUnlocking, onSuccess],
    ),
  );

  return {
    form,
    handleSubmit,
    isUnlocking,
    setIsUnlocking,
  };
};
