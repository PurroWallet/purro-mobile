import type { ComponentProps } from 'react';
import React from 'react';
import {
  Controller,
  type ControllerProps,
  type FieldValues,
  type Path,
  RegisterOptions,
  useFormContext,
} from 'react-hook-form';
import { TextInput as RNTextInput, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from '@/components/Icon';
import { Colors } from '@/constants/colors';
import { useTranslation } from '@/utils/i18n';

export type InputSize = 'sm' | 'md' | 'lg';

export type TextInputExtraProps = Omit<
  React.ComponentProps<typeof RNTextInput>,
  'value' | 'onChangeText' | 'onBlur'
>;

export interface CommonInputProps<TFieldValues extends FieldValues = FieldValues> {
  name: Path<TFieldValues>;
  label?: string;
  helperText?: string;
  rules?: RegisterOptions<TFieldValues>;
  size?: InputSize;
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'px-3 py-2',
  md: 'px-4 py-3',
  lg: 'px-5 py-4',
};

const labelSizeClasses: Record<InputSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

const helperTextSizeClasses: Record<InputSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-sm',
};

export function FormInput<TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  helperText,
  rules,
  size = 'lg',
  ...rest
}: CommonInputProps<TFieldValues> & TextInputExtraProps) {
  const { control } = useFormContext<TFieldValues>();
  const { t } = useTranslation();

  const currentSize: InputSize = size ?? 'lg';

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <View>
          {label && (
            <Text className={`mb-2 font-medium text-gray-700 ${labelSizeClasses[currentSize]}`}>
              {label}
            </Text>
          )}
          <RNTextInput
            {...rest}
            value={field.value ?? ''}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            className={`rounded-xl border ${sizeClasses[currentSize]} ${
              fieldState.error ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
            }`}
          />
          {fieldState.error?.message || helperText ? (
            <Text
              className={`mt-1.5 ${helperTextSizeClasses[currentSize]} ${
                fieldState.error ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              {fieldState.error?.message
                ? t(fieldState.error.message, fieldState.error.message ?? {})
                : helperText}
            </Text>
          ) : null}
        </View>
      )}
    />
  );
}

export function PasswordInputForm<TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  helperText,
  rules,
  size = 'lg',
  ...rest
}: CommonInputProps<TFieldValues> & TextInputExtraProps) {
  const { control } = useFormContext<TFieldValues>();
  const [showPassword, setShowPassword] = React.useState(false);
  const { t } = useTranslation();

  const currentSize: InputSize = size ?? 'lg';
  const iconSize = currentSize === 'sm' ? 18 : currentSize === 'lg' ? 22 : 20;
  const iconPosition = currentSize === 'sm' ? 'top-2' : currentSize === 'lg' ? 'top-4' : 'top-3';

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <View>
          {label && (
            <Text className={`mb-2 font-medium text-gray-700 ${labelSizeClasses[currentSize]}`}>
              {label}
            </Text>
          )}
          <View className="relative">
            <RNTextInput
              {...rest}
              value={field.value ?? ''}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              secureTextEntry={!showPassword}
              className={`rounded-xl border pr-12 ${sizeClasses[currentSize]} ${
                fieldState.error ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
              }`}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className={`absolute right-4 ${iconPosition}`}
            >
              <Icon
                name={showPassword ? 'EyeOff' : 'Eye'}
                size={iconSize}
                color={Colors.text.secondary}
              />
            </TouchableOpacity>
          </View>
          {fieldState.error?.message || helperText ? (
            <Text
              className={`mt-1.5 ${helperTextSizeClasses[currentSize]} ${
                fieldState.error ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              {fieldState.error?.message
                ? t(fieldState.error.message, fieldState.error.message ?? {})
                : helperText}
            </Text>
          ) : null}
        </View>
      )}
    />
  );
}

type CheckboxExtraProps = {
  description?: string;
  disabled?: boolean;
  onValueChange?: (value: boolean) => void;
};

export function CheckboxForm<TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  description,
  helperText,
  rules,
  disabled,
  onValueChange,
}: CommonInputProps<TFieldValues> & CheckboxExtraProps) {
  const { control } = useFormContext<TFieldValues>();
  const { t } = useTranslation();

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => {
        const value = !!field.value;
        const handleChange = (nextValue: boolean) => {
          field.onChange(nextValue);
          onValueChange?.(nextValue);
        };

        return (
          <View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleChange(!value)}
              disabled={disabled}
              className={`flex-row items-center gap-3 rounded-xl border p-4 ${
                fieldState.error ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
              } ${disabled ? 'opacity-50' : ''}`}
            >
              <View
                className={`h-6 w-6 items-center justify-center rounded-md border-2 ${
                  value ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'
                }`}
              >
                {value && <Icon name="Check" size={16} color={Colors.system.white} />}
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">{label}</Text>
                {description ? (
                  <Text className="mt-1 text-sm text-gray-500">{description}</Text>
                ) : null}
              </View>
            </TouchableOpacity>
            {fieldState.error?.message || helperText ? (
              <Text
                className={`mt-1.5 text-sm ${fieldState.error ? 'text-red-500' : 'text-gray-500'}`}
              >
                {fieldState.error?.message
                  ? t(fieldState.error.message, fieldState.error.message ?? {})
                  : helperText}
              </Text>
            ) : null}
          </View>
        );
      }}
    />
  );
}

type SwitchExtraProps = {
  description?: string;
  disabled?: boolean;
  onValueChange?: (value: boolean) => void;
};

export function SwitchForm<TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  description,
  helperText,
  rules,
  disabled,
  onValueChange,
}: CommonInputProps<TFieldValues> & SwitchExtraProps) {
  const { control } = useFormContext<TFieldValues>();

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => {
        const value = !!field.value;
        const handleChange = (nextValue: boolean) => {
          field.onChange(nextValue);
          onValueChange?.(nextValue);
        };

        return (
          <View>
            <View
              className={`flex-row items-center gap-3 rounded-xl border p-4 ${
                fieldState.error ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white'
              } ${disabled ? 'opacity-50' : ''}`}
            >
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-900">{label}</Text>
                {description ? (
                  <Text className="mt-1 text-sm text-gray-500">{description}</Text>
                ) : null}
              </View>
              <Switch
                value={value}
                onValueChange={handleChange}
                disabled={disabled}
                trackColor={{
                  false: Colors.background.secondary,
                  true: Colors.brand.primary,
                }}
                thumbColor={Colors.system.white}
              />
            </View>
            {fieldState.error?.message || helperText ? (
              <Text
                className={`mt-1.5 text-sm ${fieldState.error ? 'text-red-500' : 'text-gray-500'}`}
              >
                {fieldState.error?.message ?? helperText}
              </Text>
            ) : null}
          </View>
        );
      }}
    />
  );
}
