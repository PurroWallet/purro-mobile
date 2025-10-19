import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { BlurView } from '@react-native-community/blur';

/**
 * @description stub component for security tip
 */
export default function SecurityTipStubModal({
  visible = false,
  onOk,
}: {
  visible?: boolean;
  onOk?: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <BlurView
        className="absolute inset-0"
        blurType="light"
        blurAmount={10}
        reducedTransparencyFallbackColor="#000000"
      >
        <TouchableOpacity
          activeOpacity={1}
          className="flex-1 items-center justify-center"
          onPress={() => {}}
        >
          <View className="mx-5 max-w-xs items-center rounded-2xl bg-system-white px-6 py-6">
            <View className="mb-4">
              <Text className="text-5xl">⚠️</Text>
            </View>
            <Text className="mb-4 text-center text-xl font-bold text-system-black">
              Safety Alert
            </Text>
            <Text className="mb-6 text-center text-base leading-6 text-[#666666]">
              For your protection, screenshots/screen recordings are disabled
              when viewing your seed phrase or private key.
            </Text>
            <TouchableOpacity
              className="rounded-lg bg-brand-primary px-8 py-3"
              onPress={() => {
                onOk?.();
              }}
            >
              <Text className="text-base font-semibold text-button-primary-text">
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </BlurView>
    </Modal>
  );
}

export function GlobalSecurityTipStubModal() {
  // TODO: Implement screen recording detection and security tips
  // For now, return null to keep the app working
  return null;
}
