import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocationTracking from '../../services/locationTracking';
import * as Location from 'expo-location';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

/**
 * Test Screen for Location Tracking (No API keys needed)
 * Tests all location tracking functionality without map display
 */
export function LocationTrackingTest() {
  const [hasPermission, setHasPermission] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [locationHistory, setLocationHistory] = useState<any[]>([]);
  const [trackingInfo, setTrackingInfo] = useState({
    startTime: null as Date | null,
    updateCount: 0,
    lastUpdate: null as Date | null,
  });

  // Check permissions on mount
  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const requestPermissions = async () => {
    const granted = await LocationTracking.requestLocationPermissions();
    setHasPermission(granted);

    if (granted) {
      Alert.alert('✅ Success', 'Location permissions granted!');
    } else {
      Alert.alert('❌ Denied', 'Location permissions are required for tracking.');
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await LocationTracking.getCurrentLocation();
      if (location) {
        setCurrentLocation(location);
        Alert.alert(
          '📍 Current Location',
          `Lat: ${location.coords.latitude.toFixed(6)}\nLng: ${location.coords.longitude.toFixed(6)}\nAccuracy: ${location.coords.accuracy?.toFixed(2)}m`
        );
      }
    } catch (error: any) {
      Alert.alert('❌ Error', error.message);
    }
  };

  const startTracking = async () => {
    try {
      await LocationTracking.startLocationTracking((location) => {
        // Callback for location updates
        setCurrentLocation(location);
        setLocationHistory((prev) => [
          {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
            time: new Date(),
            accuracy: location.coords.accuracy,
          },
          ...prev.slice(0, 9), // Keep last 10 locations
        ]);
        setTrackingInfo((prev) => ({
          startTime: prev.startTime || new Date(),
          updateCount: prev.updateCount + 1,
          lastUpdate: new Date(),
        }));
      });

      setIsTracking(true);
      setTrackingInfo({
        startTime: new Date(),
        updateCount: 0,
        lastUpdate: null,
      });
      Alert.alert('✅ Tracking Started', 'Location updates will appear below');
    } catch (error: any) {
      Alert.alert('❌ Error', error.message);
    }
  };

  const stopTracking = async () => {
    try {
      await LocationTracking.stopLocationTracking();
      setIsTracking(false);
      Alert.alert('🛑 Tracking Stopped', `Total updates received: ${trackingInfo.updateCount}`);
    } catch (error: any) {
      Alert.alert('❌ Error', error.message);
    }
  };

  const startBackgroundTracking = async () => {
    try {
      await LocationTracking.startBackgroundTracking();
      Alert.alert(
        '✅ Background Tracking Started',
        'Location will be tracked even when app is in background. Check backend logs for updates.'
      );
    } catch (error: any) {
      Alert.alert('❌ Error', error.message);
    }
  };

  const stopBackgroundTracking = async () => {
    try {
      await LocationTracking.stopBackgroundTracking();
      Alert.alert('🛑 Background Tracking Stopped');
    } catch (error: any) {
      Alert.alert('❌ Error', error.message);
    }
  };

  const calculateTestDistance = () => {
    if (locationHistory.length < 2) {
      Alert.alert('ℹ️ Info', 'Need at least 2 location updates to calculate distance');
      return;
    }

    const latest = locationHistory[0];
    const previous = locationHistory[1];

    const distance = LocationTracking.calculateDistance(
      previous.lat,
      previous.lng,
      latest.lat,
      latest.lng
    );

    Alert.alert(
      '📏 Distance',
      `${distance.toFixed(2)} meters from previous location\n\n` +
        `Accuracy: ±${latest.accuracy?.toFixed(2)}m`
    );
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-textPrimary text-2xl font-bold mb-2">
            Location Tracking Test
          </Text>
          <Text className="text-textSecondary text-sm">
            Test all location features without Google Maps API
          </Text>
        </View>

        {/* Permission Status */}
        <Card className="mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <Ionicons
                name={hasPermission ? 'checkmark-circle' : 'alert-circle'}
                size={24}
                color={hasPermission ? '#10B981' : '#EF4444'}
              />
              <View className="ml-3 flex-1">
                <Text className="text-textPrimary font-semibold">
                  Location Permissions
                </Text>
                <Text className="text-textSecondary text-sm">
                  {hasPermission ? 'Granted ✓' : 'Not granted'}
                </Text>
              </View>
            </View>
            {!hasPermission && (
              <Button
                title="Grant"
                onPress={requestPermissions}
                variant="outline"
                className="ml-2"
              />
            )}
          </View>
        </Card>

        {/* Current Location */}
        {currentLocation && (
          <Card className="mb-4 bg-success/10 border border-success">
            <Text className="text-textPrimary font-bold mb-2">📍 Current Location</Text>
            <Text className="text-textSecondary text-sm">
              Lat: {currentLocation.coords.latitude.toFixed(6)}
            </Text>
            <Text className="text-textSecondary text-sm">
              Lng: {currentLocation.coords.longitude.toFixed(6)}
            </Text>
            <Text className="text-textSecondary text-sm">
              Accuracy: ±{currentLocation.coords.accuracy?.toFixed(2)}m
            </Text>
            <Text className="text-textSecondary text-sm">
              Speed: {currentLocation.coords.speed?.toFixed(2) || '0'} m/s
            </Text>
          </Card>
        )}

        {/* Tracking Status */}
        {isTracking && (
          <Card className="mb-4 bg-primary/10 border border-primary">
            <Text className="text-textPrimary font-bold mb-2">🔄 Tracking Active</Text>
            <Text className="text-textSecondary text-sm">
              Started: {trackingInfo.startTime?.toLocaleTimeString()}
            </Text>
            <Text className="text-textSecondary text-sm">
              Updates Received: {trackingInfo.updateCount}
            </Text>
            {trackingInfo.lastUpdate && (
              <Text className="text-textSecondary text-sm">
                Last Update: {trackingInfo.lastUpdate.toLocaleTimeString()}
              </Text>
            )}
          </Card>
        )}

        {/* Action Buttons */}
        <View className="space-y-3 mb-4">
          <Button
            title="Get Current Location"
            onPress={getCurrentLocation}
            icon={<Ionicons name="location-outline" size={20} color="#ffffff" />}
            disabled={!hasPermission}
          />

          <Button
            title={isTracking ? 'Stop Tracking' : 'Start Foreground Tracking'}
            onPress={isTracking ? stopTracking : startTracking}
            variant={isTracking ? 'outline' : 'primary'}
            icon={
              <Ionicons
                name={isTracking ? 'stop-circle' : 'play-circle'}
                size={20}
                color={isTracking ? '#1B9B8E' : '#ffffff'}
              />
            }
            disabled={!hasPermission}
          />

          <Button
            title="Start Background Tracking"
            onPress={startBackgroundTracking}
            variant="outline"
            icon={<Ionicons name="navigate-circle-outline" size={20} color="#1B9B8E" />}
            disabled={!hasPermission}
          />

          <Button
            title="Stop Background Tracking"
            onPress={stopBackgroundTracking}
            variant="outline"
            icon={<Ionicons name="stop-outline" size={20} color="#1B9B8E" />}
            disabled={!hasPermission}
          />

          <Button
            title="Calculate Distance"
            onPress={calculateTestDistance}
            variant="outline"
            icon={<Ionicons name="resize-outline" size={20} color="#1B9B8E" />}
            disabled={locationHistory.length < 2}
          />
        </View>

        {/* Location History */}
        {locationHistory.length > 0 && (
          <Card className="mb-4">
            <Text className="text-textPrimary font-bold mb-3">
              📋 Location History (Last 10)
            </Text>
            {locationHistory.map((loc, index) => (
              <View
                key={index}
                className="py-2 border-b border-border last:border-b-0"
              >
                <Text className="text-textSecondary text-xs">
                  {loc.time.toLocaleTimeString()} • {loc.lat.toFixed(6)}, {loc.lng.toFixed(6)}
                </Text>
                <Text className="text-textSecondary text-xs">
                  Accuracy: ±{loc.accuracy?.toFixed(2)}m
                </Text>
              </View>
            ))}
          </Card>
        )}

        {/* Instructions */}
        <Card className="bg-warning/10 border border-warning">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#F59E0B" />
            <View className="ml-2 flex-1">
              <Text className="text-textPrimary font-semibold mb-2">
                Testing Instructions:
              </Text>
              <Text className="text-textSecondary text-sm mb-1">
                1. Grant location permissions
              </Text>
              <Text className="text-textSecondary text-sm mb-1">
                2. Click "Get Current Location" to test
              </Text>
              <Text className="text-textSecondary text-sm mb-1">
                3. Start tracking to see real-time updates
              </Text>
              <Text className="text-textSecondary text-sm mb-1">
                4. Move around to see location changes
              </Text>
              <Text className="text-textSecondary text-sm mb-1">
                5. Check backend logs for API updates
              </Text>
              <Text className="text-textSecondary text-sm mt-2 font-semibold">
                ✅ No Google Maps API key needed!
              </Text>
            </View>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}
