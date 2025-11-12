import React from 'react';
import { CreatePasswordContent } from './components/CreatePasswordContent';
import { useCreatePasswordScreen } from './hooks/useCreatePasswordScreen';

const CreatePasswordScreen: React.FC = () => {
  const screenProps = useCreatePasswordScreen();

  return <CreatePasswordContent {...screenProps} />;
};

export default CreatePasswordScreen;
