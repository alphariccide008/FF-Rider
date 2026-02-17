import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../common/Button';

interface ErrorModalProps {
  visible: boolean;
  message: string;
  onClose: () => void;
  onRetry?: () => void;
}

export function ErrorModal({
  visible,
  message,
  onClose,
  onRetry,
}: ErrorModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/50 px-4">
        <View className="bg-surface rounded-3xl p-6 items-center max-w-sm w-full">
          <View className="w-16 h-16 rounded-full bg-error/20 items-center justify-center mb-4">
            <Ionicons name="close-circle" size={40} color="#EF4444" />
          </View>
          <Text className="text-textPrimary text-lg font-semibold text-center">
            Oops!
          </Text>
          <Text className="text-textSecondary text-sm text-center mt-2">
            {message}
          </Text>
          <View className="flex-row gap-3 mt-6 w-full">
            {onRetry && (
              <Button
                title="Retry"
                variant="primary"
                onPress={() => {
                  onClose();
                  onRetry();
                }}
                className="flex-1"
              />
            )}
            <Button
              title={onRetry ? 'Cancel' : 'Close'}
              variant="outline"
              onPress={onClose}
              className={onRetry ? 'flex-1' : 'w-full'}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
