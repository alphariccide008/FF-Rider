// User types
export type UserRole = 'consumer' | 'rider' | 'admin';

export interface User {
  id: string;
  phoneNumber: string;
  email?: string;
  fullName: string;
  role: UserRole;
  isVerified: boolean;
  profilePhoto?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RiderProfile extends User {
  role: 'rider';
  vehicleNumber?: string;
  licenseNumber?: string;
  bikeReadiness: BikeReadiness;
  stats?: RiderStats;
}

export type BikeReadiness = 'ready' | 'not_ready';

export interface RiderStats {
  totalDeliveries: number;
  completedToday: number;
  rating: number;
  totalEarnings: number;
}
