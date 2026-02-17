import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline, Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL } from '../../config/api.config';

interface RiderLocation {
  latitude: number | null;
  longitude: number | null;
  lastUpdate: string | null;
}

interface DestinationLocation {
  latitude: number | null;
  longitude: number | null;
  address: string;
}

interface RiderTrackingMapProps {
  orderId: string;
  accessToken: string;
  onError?: (error: string) => void;
}

export function RiderTrackingMap({ orderId, accessToken, onError }: RiderTrackingMapProps) {
  const [riderLocation, setRiderLocation] = useState<RiderLocation | null>(null);
  const [destination, setDestination] = useState<DestinationLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);

  // Fetch tracking data
  const fetchTrackingData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/tracking/order/${orderId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = response.data.data;

      setRiderLocation({
        latitude: data.rider.latitude,
        longitude: data.rider.longitude,
        lastUpdate: data.rider.lastUpdate,
      });

      setDestination({
        latitude: data.destination.latitude,
        longitude: data.destination.longitude,
        address: data.destination.address,
      });

      setLoading(false);

      // Fit map to show both rider and destination
      if (
        data.rider.latitude &&
        data.rider.longitude &&
        data.destination.latitude &&
        data.destination.longitude &&
        mapRef.current
      ) {
        mapRef.current.fitToCoordinates(
          [
            { latitude: data.rider.latitude, longitude: data.rider.longitude },
            { latitude: data.destination.latitude, longitude: data.destination.longitude },
          ],
          {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          }
        );
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch tracking data';
      setError(errorMessage);
      if (onError) onError(errorMessage);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrackingData();

    // Poll for updates every 10 seconds
    const interval = setInterval(() => {
      fetchTrackingData();
    }, 10000);

    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1B9B8E" />
        <Text style={styles.loadingText}>Loading tracking data...</Text>
      </View>
    );
  }

  if (error || !riderLocation || !destination) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorText}>{error || 'Unable to load tracking data'}</Text>
      </View>
    );
  }

  const initialRegion: Region = {
    latitude: riderLocation.latitude || 0,
    longitude: riderLocation.longitude || 0,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={true}
        showsTraffic={true}
      >
        {/* Rider Marker */}
        {riderLocation.latitude && riderLocation.longitude && (
          <Marker
            coordinate={{
              latitude: riderLocation.latitude,
              longitude: riderLocation.longitude,
            }}
            title="Your Rider"
            description="Currently on the way"
          >
            <View style={styles.riderMarker}>
              <Ionicons name="bicycle" size={24} color="#ffffff" />
            </View>
          </Marker>
        )}

        {/* Destination Marker */}
        {destination.latitude && destination.longitude && (
          <Marker
            coordinate={{
              latitude: destination.latitude,
              longitude: destination.longitude,
            }}
            title="Delivery Location"
            description={destination.address}
          >
            <View style={styles.destinationMarker}>
              <Ionicons name="location" size={28} color="#EF4444" />
            </View>
          </Marker>
        )}

        {/* Route Line */}
        {riderLocation.latitude &&
          riderLocation.longitude &&
          destination.latitude &&
          destination.longitude && (
            <Polyline
              coordinates={[
                { latitude: riderLocation.latitude, longitude: riderLocation.longitude },
                { latitude: destination.latitude, longitude: destination.longitude },
              ]}
              strokeColor="#1B9B8E"
              strokeWidth={3}
              lineDashPattern={[10, 5]}
            />
          )}
      </MapView>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={20} color="#6B7280" />
          <Text style={styles.infoText}>
            Last updated: {riderLocation.lastUpdate ? new Date(riderLocation.lastUpdate).toLocaleTimeString() : 'N/A'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="locate-outline" size={20} color="#1B9B8E" />
          <Text style={styles.infoText}>Rider is on the way to your location</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  riderMarker: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1B9B8E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  destinationMarker: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
});
