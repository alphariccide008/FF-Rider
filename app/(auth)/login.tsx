import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ErrorModal } from '../../components/modals/ErrorModal';
import { useAuthStore } from '../../stores/authStore';
import { DEFAULT_COUNTRY_CODE } from '../../utils/constants';

export default function LoginScreen() {
  const router = useRouter();
  const { loginWithPhone, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [showError, setShowError] = useState(false);

  async function handleContinue() {
    if (!email.trim()) {
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setShowError(true);
      return;
    }

    try {
      await loginWithPhone(email); // Using email instead

      // Navigate to OTP verification screen
      router.push({
        pathname: '/(auth)/verify',
        params: { email: email },
      });
    } catch (error: any) {
      setShowError(true);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView className="flex-1 bg-white">
        <View className="flex-1 px-6 pt-16 pb-8">
          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-background items-center justify-center mb-8"
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>

          {/* Logo */}
          <View className="flex-row items-center mb-12">
            <View className="w-12 h-12 bg-primary rounded-xl items-center justify-center mr-3">
              <Text className="text-2xl">⛽</Text>
            </View>
            <View>
              <Text className="text-textPrimary text-2xl font-bold">
                Flexyfuel
              </Text>
              <Text className="text-textSecondary text-xs">RIDER</Text>
            </View>
          </View>

          {/* Header */}
          <Text className="text-textPrimary text-2xl font-bold mb-2">
            Welcome Back
          </Text>
          <Text className="text-textSecondary text-base mb-8">
            Enter your email address to continue
          </Text>

          {/* Email input */}
          <View className="mb-6">
            <Input
              label="Email Address"
              placeholder="example@gmail.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
            />
          </View>

          {/* Continue button */}
          <Button
            title="Continue"
            onPress={handleContinue}
            loading={isLoading}
            disabled={!email.trim()}
            className="mb-4"
          />

          {/* Sign up link */}
          <View className="flex-row items-center justify-center mt-4">
            <Text className="text-textSecondary text-sm">
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text className="text-primary font-semibold text-sm">
                Sign up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Error Modal */}
      <ErrorModal
        visible={showError}
        message={error || 'Failed to send OTP'}
        onClose={() => {
          setShowError(false);
          clearError();
        }}
        onRetry={handleContinue}
      />
    </KeyboardAvoidingView>
  );
}
