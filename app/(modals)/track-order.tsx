import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { RiderTrackingMap } from '../../components/map/RiderTrackingMap';
import { useAuthStore } from '../../stores/authStore';

export default function TrackOrderScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { accessToken } = useAuthStore();

  if (!orderId || !accessToken) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-4">
        <Ionicons name="alert-circle-outline" size={64} color="#9CA3AF" />
        <Text className="text-textPrimary text-lg font-semibold mt-4 text-center">
          Unable to load tracking
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 bg-primary px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-primary px-4 pt-12 pb-4 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3"
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">Track Order</Text>
      </View>

      <RiderTrackingMap
        orderId={orderId}
        accessToken={accessToken}
      />
    </View>
  );
}
