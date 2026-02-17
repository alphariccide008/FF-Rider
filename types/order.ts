// Order types
export type OrderStatus =
  | 'pending'
  | 'rider_assigned'
  | 'en_route'
  | 'arrived'
  | 'completed'
  | 'cancelled';

export type DeliveryMode = 'standard' | 'priority';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  riderId?: string;
  fuelQuantity: number; // in liters
  deliveryMode: DeliveryMode;
  status: OrderStatus;
  confirmationCode?: string;
  deliveryAddress: DeliveryAddress;
  totalAmount: number;
  deliveryFee: number;
  estimatedArrival?: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  arrivedAt?: string;
  completedAt?: string;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  description?: string;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  timestamp: string;
  note?: string;
}
