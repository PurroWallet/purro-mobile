import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
        style={StyleSheet.absoluteFill}
        blurType="light"
        blurAmount={10}
        reducedTransparencyFallbackColor="#000000"
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modal}
          onPress={() => {}}
        >
          <View style={styles.container}>
            <View style={styles.icon}>
              <Text style={styles.iconText}>⚠️</Text>
            </View>
            <Text style={styles.title}>Safety Alert</Text>
            <Text style={styles.message}>
              For your protection, screenshots/screen recordings are disabled
              when viewing your seed phrase or private key.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                onOk?.();
              }}
            >
              <Text style={styles.buttonText}>OK</Text>
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

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    alignItems: 'center',
    maxWidth: 320,
  },
  icon: {
    marginBottom: 16,
  },
  iconText: {
    fontSize: 48,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#000',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
