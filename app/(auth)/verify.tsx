import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/common/Button';
import { ErrorModal } from '../../components/modals/ErrorModal';
import { useAuthStore } from '../../stores/authStore';
import { formatPhoneNumber } from '../../utils/formatters';

export default function VerifyOTPScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    email: string;
    fullName?: string;
    phoneNumber?: string;
    isSignup?: string;
  }>();
  const { email, fullName, phoneNumber, isSignup } = params;
  const { verifyOTP, loginWithPhone, completeSignup, isLoading, error, clearError } = useAuthStore();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [showError, setShowError] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  function handleCodeChange(text: string, index: number) {
    // Only allow numbers
    if (text && !/^\d+$/.test(text)) return;

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (index === 5 && text) {
      const fullCode = newCode.join('');
      if (fullCode.length === 6) {
        handleVerify(fullCode);
      }
    }
  }

  function handleKeyPress(key: string, index: number) {
    // Handle backspace
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleVerify(otpCode?: string) {
    const verificationCode = otpCode || code.join('');

    if (verificationCode.length !== 6) {
      return;
    }

    try {
      // Check if this is a signup or login
      if (isSignup === 'true' && fullName && phoneNumber) {
        // Complete signup with user data
        await completeSignup(fullName, email, phoneNumber, verificationCode);
      } else {
        // Regular login
        await verifyOTP(email, verificationCode);
      }

      // Navigate to dashboard on success
      router.replace('/(tabs)');
    } catch (error: any) {
      setShowError(true);
      // Clear code inputs on error
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  }

  async function handleResendOTP() {
    try {
      await loginWithPhone(email);
      // Clear existing code
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
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
            className="w-10 h-10 rounded-full bg-background items-center justify-center mb-12"
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>

          {/* Header */}
          <Text className="text-textPrimary text-2xl font-bold mb-2">
            Verify Email Address
          </Text>
          <Text className="text-textSecondary text-base mb-12">
            Enter the 6-digit code sent to{'\n'}
            <Text className="font-semibold text-textPrimary">
              {email}
            </Text>
          </Text>

          {/* OTP Input */}
          <View className="flex-row justify-between mb-8">
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                className={`w-12 h-14 border-2 rounded-xl text-center text-xl font-bold ${
                  digit ? 'border-primary text-primary' : 'border-border text-textPrimary'
                }`}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={({ nativeEvent: { key } }) => handleKeyPress(key, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          {/* Resend OTP */}
          <View className="flex-row items-center justify-center mb-8">
            <Text className="text-textSecondary text-sm">
              Didn't receive code?{' '}
            </Text>
            <TouchableOpacity onPress={handleResendOTP} disabled={isLoading}>
              <Text className="text-primary font-semibold text-sm">
                Resend
              </Text>
            </TouchableOpacity>
          </View>

          {/* Verify button */}
          <Button
            title="Verify"
            onPress={() => handleVerify()}
            loading={isLoading}
            disabled={code.join('').length !== 6}
          />
        </View>
      </ScrollView>

      {/* Error Modal */}
      <ErrorModal
        visible={showError}
        message={error || 'Invalid OTP code'}
        onClose={() => {
          setShowError(false);
          clearError();
        }}
        onRetry={() => handleVerify()}
      />
    </KeyboardAvoidingView>
  );
}
