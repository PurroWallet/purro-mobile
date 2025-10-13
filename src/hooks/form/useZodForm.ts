import { useForm, UseFormProps, FieldValues, UseFormReturn } from 'react-hook-form';
import { z, ZodTypeAny } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

export const useZodForm = <TSchema extends ZodTypeAny>(
  schema: TSchema,
  options?: Omit<UseFormProps<z.infer<TSchema>>, 'resolver'>,
): UseFormReturn<z.infer<TSchema>> => {
  return useForm<z.infer<TSchema>>({
    ...options,
    resolver: zodResolver(schema),
  });
};

export type ZodFormValues<TSchema extends ZodTypeAny> = z.infer<TSchema>;
