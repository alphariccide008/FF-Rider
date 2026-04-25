import React, { useEffect } from 'react';
import { View, Image, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useAuthStore } from '../stores/authStore';
import { isOnboardingComplete } from '../services/storage/secureStorage';
import { requestLocationPermissions } from '../services/locationTracking';
import * as Location from 'expo-location';

export default function SplashScreen() {
  const router = useRouter();
  const { loadStoredAuth } = useAuthStore();

  useEffect(() => {
    checkAuthAndNavigate();
  }, []);

  async function checkAuthAndNavigate() {
    try {
      // Load stored authentication
      await loadStoredAuth();

      // Small delay for splash screen effect
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Read fresh state after async load completes
      const { isAuthenticated, user } = useAuthStore.getState();

      // Check if user is authenticated and is a rider
      if (isAuthenticated && user?.role === 'rider') {
        router.replace('/(tabs)');
        // Silently ensure location permission is granted for returning riders
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
          requestLocationPermissions();
        }
        return;
      }

      // Check if onboarding is complete
      const onboardingDone = await isOnboardingComplete();

      if (!onboardingDone) {
        router.replace('/(onboarding)/welcome');
      } else {
        router.replace('/(auth)/login');
      }
    } catch (error) {
      console.error('Splash screen error:', error);
      router.replace('/(auth)/login');
    }
  }

  return (
    <View className="flex-1 items-center justify-center bg-primary px-6">
      {/* Logo and branding */}
      <View className="items-center mb-12">
        {/* Placeholder for logo - you can replace with actual image */}
        <View className="w-24 h-24 bg-white rounded-3xl items-center justify-center mb-6">
          <Text className="text-4xl">⛽</Text>
        </View>

        <Text className="text-white text-3xl font-bold">
          Flexy<Text className="text-secondary">fuel</Text>
        </Text>
        <Text className="text-white/80 text-sm mt-2">Rider App</Text>
      </View>

      <Text className="text-white/70 text-center text-sm mb-8">
        Fast. Safe. Reliable Fuel Delivery
      </Text>

      {/* Loading indicator */}
      <View className="absolute bottom-20">
        <LoadingSpinner color="#ffffff" size="small" />
      </View>
    </View>
  );
}
