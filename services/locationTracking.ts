import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { devLog, devError } from '../utils/debug';
import * as riderApi from './api/rider.api';

const LOCATION_TRACKING_TASK = 'background-location-tracking';

// Configuration
const LOCATION_UPDATE_INTERVAL = 10000; // 10 seconds
const LOCATION_UPDATE_DISTANCE = 50; // 50 meters

let locationSubscription: Location.LocationSubscription | null = null;
let isTracking = false;

/**
 * Request location permissions
 */
export async function requestLocationPermissions(): Promise<boolean> {
  try {
    // Request foreground permission
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

    if (foregroundStatus !== 'granted') {
      devError('Location permission denied', { status: foregroundStatus });
      return false;
    }

    // Request background permission (for delivery tracking)
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();

    if (backgroundStatus !== 'granted') {
      devLog('Background location permission denied - tracking will only work in foreground');
    }

    return true;
  } catch (error) {
    devError('Error requesting location permissions', error);
    return false;
  }
}

/**
 * Get current location
 */
export async function getCurrentLocation(): Promise<Location.LocationObject | null> {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return location;
  } catch (error) {
    devError('Error getting current location', error);
    return null;
  }
}

/**
 * Start tracking rider location (foreground)
 */
export async function startLocationTracking(onLocationUpdate?: (location: Location.LocationObject) => void) {
  if (isTracking) {
    devLog('Location tracking already started');
    return;
  }

  try {
    const hasPermission = await requestLocationPermissions();

    if (!hasPermission) {
      throw new Error('Location permission not granted');
    }

    // Start foreground location tracking
    locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: LOCATION_UPDATE_INTERVAL,
        distanceInterval: LOCATION_UPDATE_DISTANCE,
      },
      async (location) => {
        devLog('Location updated:', {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });

        // Send location to backend
        try {
          await riderApi.updateLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        } catch (error) {
          devError('Failed to send location to backend', error);
        }

        // Call custom callback if provided
        if (onLocationUpdate) {
          onLocationUpdate(location);
        }
      }
    );

    isTracking = true;
    devLog('✅ Location tracking started');
  } catch (error) {
    devError('Failed to start location tracking', error);
    throw error;
  }
}

/**
 * Stop tracking rider location
 */
export async function stopLocationTracking() {
  if (locationSubscription) {
    locationSubscription.remove();
    locationSubscription = null;
  }

  isTracking = false;
  devLog('❌ Location tracking stopped');
}

/**
 * Check if currently tracking
 */
export function isLocationTracking(): boolean {
  return isTracking;
}

/**
 * Start background location tracking (for deliveries)
 */
export async function startBackgroundTracking() {
  try {
    const hasPermission = await requestLocationPermissions();

    if (!hasPermission) {
      throw new Error('Location permission not granted');
    }

    // Define background task if not already defined
    if (!TaskManager.isTaskDefined(LOCATION_TRACKING_TASK)) {
      TaskManager.defineTask(LOCATION_TRACKING_TASK, async ({ data, error }: any) => {
        if (error) {
          devError('Background location error', error);
          return;
        }

        if (data) {
          const { locations } = data;
          const location = locations[0];

          // Send location to backend
          try {
            await riderApi.updateLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });

            devLog('Background location sent:', {
              lat: location.coords.latitude,
              lng: location.coords.longitude,
            });
          } catch (error) {
            devError('Failed to send background location', error);
          }
        }
      });
    }

    // Start background location updates
    await Location.startLocationUpdatesAsync(LOCATION_TRACKING_TASK, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: LOCATION_UPDATE_INTERVAL,
      distanceInterval: LOCATION_UPDATE_DISTANCE,
      foregroundService: {
        notificationTitle: 'FlexyFuel Delivery',
        notificationBody: 'Tracking your delivery location',
      },
    });

    devLog('✅ Background location tracking started');
  } catch (error) {
    devError('Failed to start background tracking', error);
    throw error;
  }
}

/**
 * Stop background location tracking
 */
export async function stopBackgroundTracking() {
  try {
    const isRegistered = await Location.hasStartedLocationUpdatesAsync(LOCATION_TRACKING_TASK);

    if (isRegistered) {
      await Location.stopLocationUpdatesAsync(LOCATION_TRACKING_TASK);
      devLog('❌ Background location tracking stopped');
    }
  } catch (error) {
    devError('Failed to stop background tracking', error);
  }
}

/**
 * Calculate distance between two coordinates (in meters)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Get estimated time of arrival (ETA) in minutes
 */
export function calculateETA(distanceInMeters: number, averageSpeedKmh: number = 40): number {
  const distanceInKm = distanceInMeters / 1000;
  const timeInHours = distanceInKm / averageSpeedKmh;
  return Math.round(timeInHours * 60); // Convert to minutes
}
