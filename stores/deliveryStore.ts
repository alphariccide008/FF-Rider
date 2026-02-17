import { create } from 'zustand';
import { Order } from '../types/order';
import { RiderStats, BikeReadiness } from '../types/user';
import * as riderApi from '../services/api/rider.api';
import { devLog, devError } from '../utils/debug';
import * as LocationTracking from '../services/locationTracking';

interface DeliveryState {
  // State
  assignedOrders: Order[];
  activeOrder: Order | null;
  stats: RiderStats | null;
  bikeReadiness: BikeReadiness | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Actions
  fetchDashboard: () => Promise<void>;
  fetchAssignedOrders: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  updateBikeReadiness: (status: BikeReadiness) => Promise<void>;
  startDelivery: (orderId: string) => Promise<void>;
  markArrived: (orderId: string) => Promise<void>;
  completeDelivery: (orderId: string, confirmationCode: string) => Promise<void>;
  setActiveOrder: (order: Order | null) => void;
  clearError: () => void;
}

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  // Initial state
  assignedOrders: [],
  activeOrder: null,
  stats: null,
  bikeReadiness: null,
  isLoading: false,
  isRefreshing: false,
  error: null,

  /**
   * Fetch rider dashboard (orders and stats)
   */
  fetchDashboard: async () => {
    try {
      set({ isLoading: true, error: null });

      // Fetch dashboard stats and assigned orders in parallel
      const [dashboard, orders] = await Promise.all([
        riderApi.getRiderDashboard(),
        riderApi.getAssignedOrders(),
      ]);

      set({
        assignedOrders: orders,
        stats: {
          completedToday: dashboard.stats.completedToday,
          totalEarnings: dashboard.stats.earningsToday,
          rating: 0, // Backend doesn't provide rating yet
        },
        isLoading: false,
      });

      devLog('Dashboard loaded');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load dashboard';
      set({ isLoading: false, error: errorMessage });
      devError('Fetch dashboard failed', error);
      throw error;
    }
  },

  /**
   * Fetch assigned orders
   */
  fetchAssignedOrders: async () => {
    try {
      set({ isLoading: true, error: null });

      const orders = await riderApi.getAssignedOrders();

      set({
        assignedOrders: orders,
        isLoading: false,
      });

      devLog('Assigned orders loaded');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load orders';
      set({ isLoading: false, error: errorMessage });
      devError('Fetch orders failed', error);
      throw error;
    }
  },

  /**
   * Refresh orders (for pull-to-refresh)
   */
  refreshOrders: async () => {
    try {
      set({ isRefreshing: true, error: null });

      const orders = await riderApi.getAssignedOrders();

      set({
        assignedOrders: orders,
        isRefreshing: false,
      });

      devLog('Orders refreshed');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to refresh orders';
      set({ isRefreshing: false, error: errorMessage });
      devError('Refresh orders failed', error);
    }
  },

  /**
   * Update bike readiness status
   */
  updateBikeReadiness: async (status: BikeReadiness, checklistItems: string[]) => {
    try {
      set({ isLoading: true, error: null });

      await riderApi.updateBikeReadiness(status, checklistItems);

      set({
        bikeReadiness: status,
        isLoading: false,
      });

      devLog('Bike readiness updated:', status, 'Checklist:', checklistItems);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update bike status';
      set({ isLoading: false, error: errorMessage });
      devError('Update bike readiness failed', error);
      throw error;
    }
  },

  /**
   * Start delivery (mark as En Route)
   */
  startDelivery: async (orderId: string) => {
    try {
      set({ isLoading: true, error: null });

      const updatedOrder = await riderApi.startDelivery(orderId);

      // Start location tracking when delivery starts
      try {
        await LocationTracking.startBackgroundTracking();
        devLog('📍 Location tracking started for delivery');
      } catch (trackingError) {
        devError('Failed to start location tracking', trackingError);
        // Continue even if tracking fails
      }

      // Update order in list
      set((state) => ({
        assignedOrders: state.assignedOrders.map((order) =>
          order.id === orderId ? updatedOrder : order
        ),
        activeOrder: updatedOrder,
        isLoading: false,
      }));

      devLog('Delivery started:', orderId);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to start delivery';
      set({ isLoading: false, error: errorMessage });
      devError('Start delivery failed', error);
      throw error;
    }
  },

  /**
   * Mark as arrived at delivery location
   */
  markArrived: async (orderId: string) => {
    try {
      set({ isLoading: true, error: null });

      const updatedOrder = await riderApi.markArrived(orderId);

      // Update order in list
      set((state) => ({
        assignedOrders: state.assignedOrders.map((order) =>
          order.id === orderId ? updatedOrder : order
        ),
        activeOrder: updatedOrder,
        isLoading: false,
      }));

      devLog('Marked as arrived:', orderId);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to mark as arrived';
      set({ isLoading: false, error: errorMessage });
      devError('Mark arrived failed', error);
      throw error;
    }
  },

  /**
   * Complete delivery with confirmation code
   */
  completeDelivery: async (orderId: string, confirmationCode: string) => {
    try {
      set({ isLoading: true, error: null });

      const updatedOrder = await riderApi.completeDelivery(orderId, confirmationCode);

      // Stop location tracking when delivery is completed
      try {
        await LocationTracking.stopBackgroundTracking();
        devLog('📍 Location tracking stopped - delivery completed');
      } catch (trackingError) {
        devError('Failed to stop location tracking', trackingError);
      }

      // Update order in list
      set((state) => ({
        assignedOrders: state.assignedOrders.map((order) =>
          order.id === orderId ? updatedOrder : order
        ),
        activeOrder: null, // Clear active order
        isLoading: false,
      }));

      devLog('Delivery completed:', orderId);
    } catch (error: any) {
      const errorMessage = error.message || 'Invalid confirmation code';
      set({ isLoading: false, error: errorMessage });
      devError('Complete delivery failed', error);
      throw error;
    }
  },

  /**
   * Set active order
   */
  setActiveOrder: (order: Order | null) => {
    set({ activeOrder: order });
  },

  /**
   * Clear error
   */
  clearError: () => {
    set({ error: null });
  },
}));
