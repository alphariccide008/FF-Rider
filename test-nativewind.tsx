// Test file to verify NativeWind is working
import React from 'react';
import { View, Text } from 'react-native';

export default function TestNativeWind() {
  return (
    <View className="flex-1 bg-primary items-center justify-center">
      <Text className="text-white text-2xl font-bold">
        NativeWind is Working! ✅
      </Text>
      <Text className="text-secondary text-lg mt-4">
        Tailwind classes are applied correctly
      </Text>
    </View>
  );
}
