import apiClient from './client';
import { ApiResponse } from '../../types/api';
import { Order } from '../../types/order';
import { BikeReadiness, RiderStats } from '../../types/user';

interface DashboardResponse {
  rider: {
    id: string;
    fullName: string;
    phoneNumber: string;
  };
  riderDetails: any;
  stats: {
    assignedOrders: number;  // Count, not array!
    completedToday: number;
    earningsToday: number;
  };
}

interface UpdateLocationPayload {
  latitude: number;
  longitude: number;
}

interface CompleteDeliveryPayload {
  confirmationCode: string;
}

/**
 * Get rider dashboard data (assigned orders and stats)
 */
export async function getRiderDashboard(): Promise<DashboardResponse> {
  const response = await apiClient.get<ApiResponse<DashboardResponse>>('/riders/dashboard');
  return response.data.data!;
}

/**
 * Get assigned orders
 */
export async function getAssignedOrders(): Promise<Order[]> {
  const response = await apiClient.get<ApiResponse<Order[]>>('/riders/assigned-orders');
  return response.data.data!;
}

/**
 * Update bike readiness status
 */
export async function updateBikeReadiness(
  status: BikeReadiness,
  checklistItems: string[]
): Promise<void> {
  // Backend expects { bikeReady: boolean, checklistItems: string[] }
  const bikeReady = status === 'ready';
  await apiClient.patch('/riders/bike-ready', { bikeReady, checklistItems });
}

/**
 * Update rider location
 */
export async function updateLocation(location: UpdateLocationPayload): Promise<void> {
  await apiClient.patch('/riders/location', location);
}

/**
 * Start delivery (mark as En Route)
 */
export async function startDelivery(orderId: string): Promise<Order> {
  const response = await apiClient.post<ApiResponse<Order>>(`/riders/orders/${orderId}/start`);
  return response.data.data!;
}

/**
 * Mark as arrived at delivery location
 */
export async function markArrived(orderId: string): Promise<Order> {
  const response = await apiClient.post<ApiResponse<Order>>(`/riders/orders/${orderId}/arrive`);
  return response.data.data!;
}

/**
 * Complete delivery with confirmation code
 */
export async function completeDelivery(
  orderId: string,
  confirmationCode: string
): Promise<Order> {
  const response = await apiClient.post<ApiResponse<Order>>(
    `/riders/orders/${orderId}/complete`,
    { confirmationCode }
  );
  return response.data.data!;
}
