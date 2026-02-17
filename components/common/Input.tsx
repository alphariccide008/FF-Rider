import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  className,
  ...props
}: InputProps) {
  return (
    <View className="w-full">
      {label && (
        <Text className="text-textPrimary font-medium mb-2 text-sm">{label}</Text>
      )}
      <View
        className={`flex-row items-center bg-surface border rounded-xl px-4 ${
          error ? 'border-error' : 'border-border'
        }`}
      >
        {leftIcon && <View className="mr-2">{leftIcon}</View>}
        <TextInput
          className={`flex-1 py-3 text-textPrimary text-base ${className || ''}`}
          placeholderTextColor="#9CA3AF"
          {...props}
        />
        {rightIcon && <View className="ml-2">{rightIcon}</View>}
      </View>
      {error && <Text className="text-error text-xs mt-1">{error}</Text>}
    </View>
  );
}
