import { Stack } from 'expo-router';
import { useEffect } from 'react';
import './global.css';
import { logAPIConfig } from '../utils/debug';

export default function RootLayout() {
  // Log API configuration on app start
  useEffect(() => {
    logAPIConfig();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F9FAFB' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="(modals)"
        options={{ presentation: 'modal' }}
      />
    </Stack>
  );
}
