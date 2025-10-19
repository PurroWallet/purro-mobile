import { useForm, UseFormProps, UseFormReturn, FieldValues } from 'react-hook-form';
import { z, ZodTypeAny } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

type InferFieldValues<TSchema extends ZodTypeAny> = z.infer<TSchema> extends FieldValues
  ? z.infer<TSchema>
  : never;

export function useZodForm<TSchema extends ZodTypeAny>(
  schema: TSchema,
  options?: Omit<UseFormProps<InferFieldValues<TSchema>>, 'resolver'>,
): UseFormReturn<InferFieldValues<TSchema>, any, InferFieldValues<TSchema>> {
  const form = useForm<InferFieldValues<TSchema>, any, InferFieldValues<TSchema>>({
    ...(options as UseFormProps<InferFieldValues<TSchema>>),
    resolver: zodResolver(schema as never) as any,
  });

  return form as UseFormReturn<InferFieldValues<TSchema>, any, InferFieldValues<TSchema>>;
}

export type ZodFormValues<TSchema extends ZodTypeAny> = z.infer<TSchema>;