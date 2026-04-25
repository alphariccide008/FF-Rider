import { OrderStatus } from '../types/order';

// App constants
export const APP_NAME = 'Flexyfuel Rider';
export const APP_VERSION = '1.0.0';

// API Configuration
export const API_TIMEOUT = 60000; // 60 seconds (handles Render cold starts)

// Order Status Display Names
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  rider_assigned: 'Assigned',
  en_route: 'En Route',
  arrived: 'Arrived',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

// Order Status Colors (Tailwind classes)
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: '#F59E0B',       // Orange
  rider_assigned: '#3B82F6', // Blue
  en_route: '#8B5CF6',      // Purple
  arrived: '#06B6D4',       // Cyan
  completed: '#10B981',     // Green
  cancelled: '#EF4444',     // Red
};

// Fuel Quantities (in liters)
export const FUEL_QUANTITIES = [5, 10, 20, 30, 40, 50];

// Phone Number
export const DEFAULT_COUNTRY_CODE = '+234';

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  BIKE_READINESS: 'bike_readiness',
};

// Auto-refresh intervals
export const REFRESH_INTERVALS = {
  DELIVERIES: 30000,      // 30 seconds
  LOCATION: 10000,        // 10 seconds
  STATS: 60000,           // 1 minute
};
