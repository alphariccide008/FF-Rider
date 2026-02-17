import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/common/Button';
import { setOnboardingComplete } from '../../services/storage/secureStorage';

export default function WelcomeScreen() {
  const router = useRouter();

  async function handleGetStarted() {
    await setOnboardingComplete();
    router.replace('/(auth)/signup');
  }

  return (
    <ScrollView className="flex-1 bg-primary">
      <View className="flex-1 px-6 pt-16 pb-8">
        {/* Logo */}
        <View className="items-start mb-8">
          <View className="w-16 h-16 bg-white rounded-2xl items-center justify-center mb-4">
            <Text className="text-3xl">⛽</Text>
          </View>
          <Text className="text-white text-2xl font-bold">Flexyfuel</Text>
        </View>

        {/* Main content with decorative circles */}
        <View className="flex-1 items-center justify-center mb-12">
          {/* Decorative background circles */}
          <View className="items-center">
            <View className="w-64 h-64 rounded-full bg-primary/30 items-center justify-center">
              <View className="w-48 h-48 rounded-full bg-primary/50 items-center justify-center">
                <View className="w-32 h-32 rounded-full bg-secondary items-center justify-center">
                  <Ionicons name="bicycle" size={60} color="#1B9B8E" />
                </View>
              </View>
            </View>
          </View>

          {/* Title */}
          <Text className="text-white text-3xl font-bold text-center mt-12 mb-4">
            Deliver fuel, earn on{'\n'}your schedule
          </Text>
          <Text className="text-white/80 text-center text-base mb-12">
            Join thousands of riders making extra income
          </Text>
        </View>

        {/* Features */}
        <View className="mb-8 space-y-4">
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center mr-4">
              <Ionicons name="flash" size={24} color="#F7DC6F" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold text-base">Fast Payouts</Text>
              <Text className="text-white/70 text-sm">
                Get paid instantly after each delivery
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center mr-4">
              <Ionicons name="navigate" size={24} color="#F7DC6F" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold text-base">Easy Navigation</Text>
              <Text className="text-white/70 text-sm">
                Built-in GPS navigation to customers
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center mr-4">
              <Ionicons name="wallet" size={24} color="#F7DC6F" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold text-base">Great Earnings</Text>
              <Text className="text-white/70 text-sm">
                Competitive rates and bonuses
              </Text>
            </View>
          </View>
        </View>

        {/* CTA Button */}
        <Button
          title="Get Started"
          onPress={handleGetStarted}
          className="bg-white mb-4"
        />
        <Button
          title="Login"
          variant="outline"
          onPress={() => router.replace('/(auth)/login')}
          className="border-white"
        />
      </View>
    </ScrollView>
  );
}
