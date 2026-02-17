import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL } from '../../config/api.config';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

/**
 * Test Backend Tracking APIs (No Map/API keys needed)
 * Verify backend endpoints work correctly
 */
export function BackendTrackingTest() {
  const [orderId, setOrderId] = useState('');
  const [riderId, setRiderId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testOrderTracking = async () => {
    if (!orderId || !accessToken) {
      Alert.alert('❌ Error', 'Please enter Order ID and Access Token');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await axios.get(`${BASE_URL}/tracking/order/${orderId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setResponse(res.data);
      Alert.alert('✅ Success', 'Order tracking data received!');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      Alert.alert('❌ Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const testRiderLocation = async () => {
    if (!riderId || !accessToken) {
      Alert.alert('❌ Error', 'Please enter Rider ID and Access Token');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await axios.get(`${BASE_URL}/tracking/rider/${riderId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setResponse(res.data);
      Alert.alert('✅ Success', 'Rider location received!');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      Alert.alert('❌ Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const testActiveRiders = async () => {
    if (!accessToken) {
      Alert.alert('❌ Error', 'Please enter Admin Access Token');
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await axios.get(`${BASE_URL}/tracking/riders/active`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setResponse(res.data);
      Alert.alert(
        '✅ Success',
        `Found ${res.data.data?.length || 0} active riders!`
      );
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      Alert.alert('❌ Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const testBackendHealth = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await axios.get(`${BASE_URL}/../health`);
      setResponse(res.data);
      Alert.alert('✅ Backend Online', `Environment: ${res.data.environment}`);
    } catch (err: any) {
      const errorMsg = err.message;
      setError(errorMsg);
      Alert.alert('❌ Backend Offline', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-textPrimary text-2xl font-bold mb-2">
            Backend API Test
          </Text>
          <Text className="text-textSecondary text-sm">
            Test tracking endpoints without map display
          </Text>
        </View>

        {/* Backend Status */}
        <Card className="mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-textPrimary font-bold">Backend Status</Text>
            <Button
              title="Check"
              onPress={testBackendHealth}
              variant="outline"
              loading={loading}
            />
          </View>
          <Text className="text-textSecondary text-sm">
            Base URL: {BASE_URL}
          </Text>
        </Card>

        {/* Test Inputs */}
        <Card className="mb-4">
          <Text className="text-textPrimary font-bold mb-3">Test Inputs</Text>

          <Input
            label="Access Token (JWT)"
            value={accessToken}
            onChangeText={setAccessToken}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            autoCapitalize="none"
            className="mb-3"
          />

          <Input
            label="Order ID (for order tracking)"
            value={orderId}
            onChangeText={setOrderId}
            placeholder="abc123..."
            autoCapitalize="none"
            className="mb-3"
          />

          <Input
            label="Rider ID (for rider location)"
            value={riderId}
            onChangeText={setRiderId}
            placeholder="rider123..."
            autoCapitalize="none"
          />
        </Card>

        {/* Test Buttons */}
        <View className="space-y-3 mb-4">
          <Button
            title="Test Order Tracking"
            onPress={testOrderTracking}
            loading={loading}
            icon={<Ionicons name="bicycle-outline" size={20} color="#ffffff" />}
          />

          <Button
            title="Test Rider Location"
            onPress={testRiderLocation}
            loading={loading}
            icon={<Ionicons name="location-outline" size={20} color="#ffffff" />}
          />

          <Button
            title="Test Active Riders (Admin)"
            onPress={testActiveRiders}
            loading={loading}
            icon={<Ionicons name="people-outline" size={20} color="#ffffff" />}
          />
        </View>

        {/* Error Display */}
        {error && (
          <Card className="mb-4 bg-error/10 border border-error">
            <View className="flex-row items-start">
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <View className="ml-2 flex-1">
                <Text className="text-error font-semibold mb-1">Error</Text>
                <Text className="text-error text-sm">{error}</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Response Display */}
        {response && (
          <Card className="mb-4 bg-success/10 border border-success">
            <Text className="text-textPrimary font-bold mb-3">
              📡 API Response
            </Text>
            <ScrollView
              horizontal
              className="max-h-96"
              showsVerticalScrollIndicator={false}
            >
              <Text className="text-textSecondary text-xs font-mono">
                {JSON.stringify(response, null, 2)}
              </Text>
            </ScrollView>
          </Card>
        )}

        {/* API Endpoints Reference */}
        <Card className="mb-4">
          <Text className="text-textPrimary font-bold mb-3">
            📚 Available Endpoints
          </Text>

          <View className="space-y-2">
            <View>
              <Text className="text-textPrimary text-sm font-semibold">
                GET /tracking/order/:orderId
              </Text>
              <Text className="text-textSecondary text-xs">
                Track rider location for a specific order (Customer)
              </Text>
            </View>

            <View>
              <Text className="text-textPrimary text-sm font-semibold">
                GET /tracking/rider/:riderId
              </Text>
              <Text className="text-textSecondary text-xs">
                Get specific rider's current location
              </Text>
            </View>

            <View>
              <Text className="text-textPrimary text-sm font-semibold">
                GET /tracking/riders/active
              </Text>
              <Text className="text-textSecondary text-xs">
                Get all active riders with locations (Admin only)
              </Text>
            </View>
          </View>
        </Card>

        {/* Instructions */}
        <Card className="bg-primary/10 border border-primary">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#1B9B8E" />
            <View className="ml-2 flex-1">
              <Text className="text-textPrimary font-semibold mb-2">
                How to Test:
              </Text>
              <Text className="text-textSecondary text-sm mb-1">
                1. Login to get your access token
              </Text>
              <Text className="text-textSecondary text-sm mb-1">
                2. Start a delivery to get Order ID
              </Text>
              <Text className="text-textSecondary text-sm mb-1">
                3. Paste token and IDs above
              </Text>
              <Text className="text-textSecondary text-sm mb-1">
                4. Click test buttons to verify APIs
              </Text>
              <Text className="text-textSecondary text-sm mt-2 font-semibold">
                ✅ Works without Google Maps API!
              </Text>
            </View>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}
