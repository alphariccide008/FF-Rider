import React, { useEffect } from 'react';
import { Modal, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SuccessModalProps {
  visible: boolean;
  message: string;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function SuccessModal({
  visible,
  message,
  onClose,
  autoClose = true,
  duration = 2000,
}: SuccessModalProps) {
  useEffect(() => {
    if (visible && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, autoClose, duration, onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/50 px-4">
        <View className="bg-surface rounded-3xl p-6 items-center max-w-sm w-full">
          <View className="w-16 h-16 rounded-full bg-success/20 items-center justify-center mb-4">
            <Ionicons name="checkmark-circle" size={40} color="#10B981" />
          </View>
          <Text className="text-textPrimary text-lg font-semibold text-center">
            Success!
          </Text>
          <Text className="text-textSecondary text-sm text-center mt-2">
            {message}
          </Text>
        </View>
      </View>
    </Modal>
  );
}
