import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <View
      className={`bg-surface rounded-2xl p-4 shadow-sm border border-border ${className || ''}`}
      {...props}
    >
      {children}
    </View>
  );
}
