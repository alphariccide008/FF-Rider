import React from 'react';
import { View, Text } from 'react-native';
import { OrderStatus } from '../../types/order';
import { ORDER_STATUS_COLORS } from '../../utils/constants';

interface BadgeProps {
  label: string;
  status?: OrderStatus;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Badge({ label, status, color, size = 'md' }: BadgeProps) {
  const backgroundColor = status ? ORDER_STATUS_COLORS[status] : color || '#6B7280';

  const sizeClasses = {
    sm: 'px-2 py-0.5',
    md: 'px-3 py-1',
    lg: 'px-4 py-1.5',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <View
      className={`rounded-full self-start ${sizeClasses[size]}`}
      style={{ backgroundColor }}
    >
      <Text className={`text-white font-medium ${textSizeClasses[size]}`}>
        {label}
      </Text>
    </View>
  );
}
