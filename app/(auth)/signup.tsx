import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ErrorModal } from '../../components/modals/ErrorModal';
import { DEFAULT_COUNTRY_CODE } from '../../utils/constants';
import { signupWithEmail } from '../../services/api/auth.api';

export default function SignupScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Field-level errors
  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  function validateFullName(value: string): boolean {
    if (!value.trim()) {
      setFullNameError('Please enter your full name');
      return false;
    }
    setFullNameError('');
    return true;
  }

  function validateEmail(value: string): boolean {
    if (!value.trim()) {
      setEmailError('Please enter your email address');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError('Invalid email address');
      return false;
    }

    setEmailError('');
    return true;
  }

  function validatePhone(value: string): boolean {
    if (!value.trim()) {
      setPhoneError('Enter a valid phone number');
      return false;
    }

    if (value.length < 10) {
      setPhoneError('Enter a valid phone number');
      return false;
    }

    setPhoneError('');
    return true;
  }

  async function handleContinue() {
    // Validate all fields
    const isNameValid = validateFullName(fullName);
    const isEmailValid = validateEmail(email);
    const isPhoneValid = validatePhone(phoneNumber);

    if (!isNameValid || !isEmailValid || !isPhoneValid) {
      return;
    }

    // Format phone number with country code
    const fullPhoneNumber = phoneNumber.startsWith('+')
      ? phoneNumber
      : `${DEFAULT_COUNTRY_CODE}${phoneNumber}`;

    try {
      setIsLoading(true);

      // Send OTP to email
      await signupWithEmail(email);

      // Navigate to verify screen with user data
      router.push({
        pathname: '/(auth)/verify',
        params: {
          email: email,
          fullName: fullName,
          phoneNumber: fullPhoneNumber,
          isSignup: 'true'
        },
      });
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to send OTP. Please try again.');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  }

  const isFormValid = fullName.trim() && email.trim() && phoneNumber.trim();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView className="flex-1 bg-background">
        <View className="flex-1 px-6 pt-16 pb-8">
          {/* Back button */}
          <TouchableOpacity
            onPress={() => router.canGoBack() ? router.back() : router.replace('/(onboarding)/welcome')}
            className="w-10 h-10 rounded-full bg-white items-center justify-center mb-12"
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>

          {/* Header */}
          <Text className="text-textPrimary text-2xl font-bold mb-2">
            Let's Get You Started
          </Text>
          <Text className="text-textSecondary text-base mb-8">
            Create your rider profile
          </Text>

          {/* Full Name input */}
          <View className="mb-4">
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                if (fullNameError) setFullNameError('');
              }}
              onBlur={() => validateFullName(fullName)}
              error={fullNameError}
              autoFocus
            />
          </View>

          {/* Email input */}
          <View className="mb-4">
            <Input
              label="Email Address"
              placeholder="example@gmail.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError('');
              }}
              onBlur={() => validateEmail(email)}
              error={emailError}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Phone number input */}
          <View className="mb-8">
            <Input
              label="Phone Number"
              placeholder="8123456789"
              value={phoneNumber}
              onChangeText={(text) => {
                setPhoneNumber(text);
                if (phoneError) setPhoneError('');
              }}
              onBlur={() => validatePhone(phoneNumber)}
              error={phoneError}
              keyboardType="phone-pad"
              leftIcon={
                <Text className="text-textSecondary font-medium">
                  {DEFAULT_COUNTRY_CODE}
                </Text>
              }
            />
          </View>

          {/* Continue button */}
          <Button
            title="Continue"
            onPress={handleContinue}
            loading={isLoading}
            disabled={!isFormValid}
          />
        </View>
      </ScrollView>

      {/* Error Modal */}
      <ErrorModal
        visible={showError}
        message={errorMessage}
        onClose={() => setShowError(false)}
        onRetry={handleContinue}
      />
    </KeyboardAvoidingView>
  );
}
