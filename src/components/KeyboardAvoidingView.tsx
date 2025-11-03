import type { FC, PropsWithChildren } from 'react';
import type { ViewStyle } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

interface KeyboardAvoidingViewProps extends PropsWithChildren {
  paddingHorizontal?: boolean;
  style?: ViewStyle;
  className?: string;
}

const KeyboardAvoidingView: FC<KeyboardAvoidingViewProps> = ({
  children,
  paddingHorizontal = false,
  style,
  className,
}) => {
  const baseClasses = 'flex-1 bg-primary';
  const paddingClasses = paddingHorizontal ? ' px-5' : '';
  const combinedClasses = `${baseClasses}${paddingClasses}${className ? ` ${className}` : ''}`;

  return (
    <KeyboardAwareScrollView
      className="flex-1"
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <SafeAreaView className={combinedClasses} style={style}>
        {children}
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
};

export default KeyboardAvoidingView;
