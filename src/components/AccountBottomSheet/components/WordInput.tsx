import React from 'react';
import { FormInput } from '@/components';

interface WordInputProps {
  name: string;
  label: string;
  returnKeyType: 'next' | 'done';
  onSubmitEditing: () => void;
}

export const WordInput: React.FC<WordInputProps> = ({
  name,
  label,
  returnKeyType,
  onSubmitEditing,
}) => (
  <FormInput
    name={name}
    label={label}
    placeholder={label}
    autoCapitalize="none"
    autoCorrect={false}
    textContentType="oneTimeCode"
    returnKeyType={returnKeyType}
    onSubmitEditing={onSubmitEditing}
  />
);

WordInput.displayName = 'WordInput';
