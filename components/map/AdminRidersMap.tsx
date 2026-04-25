import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region, Callout } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { BASE_URL } from '../../config/api.config';

interface CurrentDelivery {
  orderNumber: string;
  status: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  fuelQuantity: number;
  deliveryMode: string;
  totalAmount: number;
  deliveryFee: number;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
    description?: string;
  };
  estimatedArrival?: string;
  createdAt: string;
}

interface RiderData {
  riderId: string;
  riderName: string;
  riderPhone: string;
  latitude: number | null;
  longitude: number | null;
  lastUpdate: string | null;
  isAvailable: boolean;
  bikeReady: boolean;
  activeOrders: number;
  currentDelivery: CurrentDelivery | null;
}

interface AdminRidersMapProps {
  accessToken: string;
  onError?: (error: string) => void;
}

export function AdminRidersMap({ accessToken, onError }: AdminRidersMapProps) {
  const [riders, setRiders] = useState<RiderData[]>([]);
  const [selectedRider, setSelectedRider] = useState<RiderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);

  // Fetch active riders
  const fetchActiveRiders = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/tracking/riders/active`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = response.data.data;
      setRiders(data);
      setLoading(false);

      // Fit map to show all riders
      if (data.length > 0 && mapRef.current) {
        const validCoordinates = data
          .filter((r: RiderData) => r.latitude && r.longitude)
          .map((r: RiderData) => ({
            latitude: r.latitude!,
            longitude: r.longitude!,
          }));

        if (validCoordinates.length > 0) {
          mapRef.current.fitToCoordinates(validCoordinates, {
            edgePadding: { top: 100, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch active riders';
      setError(errorMessage);
      if (onError) onError(errorMessage);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveRiders();

    // Poll for updates every 15 seconds
    const interval = setInterval(() => {
      fetchActiveRiders();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1B9B8E" />
        <Text style={styles.loadingText}>Loading active riders...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const initialRegion: Region = {
    latitude: riders[0]?.latitude || 6.5244, // Default to Lagos, Nigeria
    longitude: riders[0]?.longitude || 3.3792,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
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
        {riders.map((rider) => {
          if (!rider.latitude || !rider.longitude) return null;

          return (
            <Marker
              key={rider.riderId}
              coordinate={{
                latitude: rider.latitude,
                longitude: rider.longitude,
              }}
              onPress={() => setSelectedRider(rider)}
            >
              <View
                style={[
                  styles.riderMarker,
                  {
                    backgroundColor: rider.activeOrders > 0 ? '#1B9B8E' : '#6B7280',
                  },
                ]}
              >
                <Ionicons name="bicycle" size={20} color="#ffffff" />
                {rider.activeOrders > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{rider.activeOrders}</Text>
                  </View>
                )}
              </View>
              <Callout tooltip>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{rider.riderName}</Text>
                  <Text style={styles.calloutText}>
                    Status: {rider.activeOrders > 0 ? 'On Delivery' : 'Available'}
                  </Text>
                  <Text style={styles.calloutText}>Active Orders: {rider.activeOrders}</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* Stats Card */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Ionicons name="people-outline" size={24} color="#1B9B8E" />
          <View style={styles.statContent}>
            <Text style={styles.statValue}>{riders.length}</Text>
            <Text style={styles.statLabel}>Active Riders</Text>
          </View>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="bicycle-outline" size={24} color="#F59E0B" />
          <View style={styles.statContent}>
            <Text style={styles.statValue}>
              {riders.filter((r) => r.activeOrders > 0).length}
            </Text>
            <Text style={styles.statLabel}>On Delivery</Text>
          </View>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="checkmark-circle-outline" size={24} color="#10B981" />
          <View style={styles.statContent}>
            <Text style={styles.statValue}>
              {riders.filter((r) => r.activeOrders === 0).length}
            </Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
        </View>
      </View>

      {/* Selected Rider Details */}
      {selectedRider && (
        <View style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsTitle}>{selectedRider.riderName}</Text>
            <TouchableOpacity onPress={() => setSelectedRider(null)}>
              <Ionicons name="close-circle" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.detailsBody}>
            <View style={styles.detailRow}>
              <Ionicons name="call-outline" size={18} color="#6B7280" />
              <Text style={styles.detailText}>{selectedRider.riderPhone}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons
                name={selectedRider.bikeReady ? 'checkmark-circle' : 'close-circle'}
                size={18}
                color={selectedRider.bikeReady ? '#10B981' : '#EF4444'}
              />
              <Text style={styles.detailText}>
                Bike: {selectedRider.bikeReady ? 'Ready' : 'Not Ready'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={18} color="#6B7280" />
              <Text style={styles.detailText}>
                Last Update: {selectedRider.lastUpdate ? new Date(selectedRider.lastUpdate).toLocaleTimeString() : 'N/A'}
              </Text>
            </View>

            {selectedRider.currentDelivery && (
              <ScrollView style={styles.deliveryInfo} nestedScrollEnabled>
                <Text style={styles.deliveryTitle}>Current Delivery</Text>

                <View style={styles.deliverySection}>
                  <Text style={styles.deliverySectionLabel}>ORDER INFO</Text>
                  <View style={styles.deliveryRow}>
                    <Ionicons name="receipt-outline" size={14} color="#6B7280" />
                    <Text style={styles.deliveryText}>
                      Order #{selectedRider.currentDelivery.orderNumber}
                    </Text>
                  </View>
                  <View style={styles.deliveryRow}>
                    <Ionicons name="ellipse" size={10} color={
                      selectedRider.currentDelivery.status === 'completed' ? '#10B981' :
                      selectedRider.currentDelivery.status === 'cancelled' ? '#EF4444' : '#F59E0B'
                    } />
                    <Text style={styles.deliveryText}>
                      {selectedRider.currentDelivery.status.replace(/_/g, ' ').toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.deliveryRow}>
                    <Ionicons name="flash-outline" size={14} color="#6B7280" />
                    <Text style={styles.deliveryText}>
                      {selectedRider.currentDelivery.fuelQuantity}L · {selectedRider.currentDelivery.deliveryMode.toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.deliveryRow}>
                    <Ionicons name="cash-outline" size={14} color="#6B7280" />
                    <Text style={styles.deliveryText}>
                      ₦{selectedRider.currentDelivery.totalAmount?.toLocaleString()} (Fee: ₦{selectedRider.currentDelivery.deliveryFee?.toLocaleString()})
                    </Text>
                  </View>
                  {selectedRider.currentDelivery.estimatedArrival && (
                    <View style={styles.deliveryRow}>
                      <Ionicons name="time-outline" size={14} color="#6B7280" />
                      <Text style={styles.deliveryText}>
                        ETA: {new Date(selectedRider.currentDelivery.estimatedArrival).toLocaleTimeString()}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.deliverySection}>
                  <Text style={styles.deliverySectionLabel}>CUSTOMER INFO</Text>
                  <View style={styles.deliveryRow}>
                    <Ionicons name="person-outline" size={14} color="#6B7280" />
                    <Text style={styles.deliveryText}>
                      {selectedRider.currentDelivery.customerName}
                    </Text>
                  </View>
                  <View style={styles.deliveryRow}>
                    <Ionicons name="call-outline" size={14} color="#6B7280" />
                    <Text style={styles.deliveryText}>
                      {selectedRider.currentDelivery.customerPhone}
                    </Text>
                  </View>
                  <View style={styles.deliveryRow}>
                    <Ionicons name="finger-print-outline" size={14} color="#6B7280" />
                    <Text style={styles.deliveryText}>
                      ID: {selectedRider.currentDelivery.customerId}
                    </Text>
                  </View>
                </View>

                <View style={styles.deliverySection}>
                  <Text style={styles.deliverySectionLabel}>DELIVERY ADDRESS</Text>
                  <View style={styles.deliveryRow}>
                    <Ionicons name="location-outline" size={14} color="#6B7280" />
                    <Text style={[styles.deliveryText, { flex: 1 }]}>
                      {selectedRider.currentDelivery.deliveryAddress.street},{' '}
                      {selectedRider.currentDelivery.deliveryAddress.city},{' '}
                      {selectedRider.currentDelivery.deliveryAddress.state}
                    </Text>
                  </View>
                  {selectedRider.currentDelivery.deliveryAddress.description ? (
                    <View style={styles.deliveryRow}>
                      <Ionicons name="information-circle-outline" size={14} color="#6B7280" />
                      <Text style={[styles.deliveryText, { flex: 1 }]}>
                        {selectedRider.currentDelivery.deliveryAddress.description}
                      </Text>
                    </View>
                  ) : null}
                  <View style={styles.deliveryRow}>
                    <Ionicons name="navigate-outline" size={14} color="#6B7280" />
                    <Text style={styles.deliveryText}>
                      {selectedRider.currentDelivery.deliveryAddress.latitude.toFixed(5)},{' '}
                      {selectedRider.currentDelivery.deliveryAddress.longitude.toFixed(5)}
                    </Text>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      )}

      {/* Refresh Button */}
      <TouchableOpacity style={styles.refreshButton} onPress={fetchActiveRiders}>
        <Ionicons name="refresh" size={24} color="#ffffff" />
      </TouchableOpacity>
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
    width: 40,
    height: 40,
    borderRadius: 20,
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
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  callout: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  calloutText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  statsCard: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statContent: {
    marginLeft: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  detailsCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 80,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    maxHeight: 420,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  detailsBody: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
  },
  deliveryInfo: {
    marginTop: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    maxHeight: 220,
  },
  deliveryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 12,
    paddingTop: 10,
    marginBottom: 6,
  },
  deliverySection: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 4,
  },
  deliverySectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1B9B8E',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 4,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 4,
  },
  deliveryText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  refreshButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1B9B8E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
