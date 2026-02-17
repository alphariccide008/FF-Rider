import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = 'large',
  color = '#1B9B8E',
  message,
  fullScreen = false,
}: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size={size} color={color} />
        {message && (
          <Text className="text-textSecondary mt-4 text-sm">{message}</Text>
        )}
      </View>
    );
  }

  return (
    <View className="items-center justify-center p-4">
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text className="text-textSecondary mt-2 text-sm">{message}</Text>
      )}
    </View>
  );
}
