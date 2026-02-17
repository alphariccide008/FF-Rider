import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  View,
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  icon,
  className,
  ...props
}: ButtonProps) {
  const baseClasses = 'rounded-xl items-center justify-center flex-row';

  const variantClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    outline: 'bg-transparent border-2 border-primary',
  };

  const sizeClasses = {
    sm: 'px-4 py-2',
    md: 'px-6 py-3',
    lg: 'px-8 py-4',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const getTextColorClass = () => {
    if (variant === 'primary') return 'text-white';
    if (variant === 'secondary') return 'text-textPrimary';
    // For outline, check if it has error border (red button)
    if (variant === 'outline' && className?.includes('border-error')) {
      return 'text-error';
    }
    return 'text-primary';
  };

  const disabledClass = disabled || loading ? 'opacity-50' : '';

  return (
    <TouchableOpacity
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClass} ${className || ''}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#ffffff' : '#1B9B8E'}
        />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon && icon}
          <Text
            className={`font-bold ${textSizeClasses[size]} ${getTextColorClass()}`}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
