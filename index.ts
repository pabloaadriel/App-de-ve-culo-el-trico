// ============================================================
// DOMAIN TYPES — VoltRide MVP
// ============================================================

export type UserRole = 'driver' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  plan: 'basic' | 'pro' | 'premium';
  freeChargesPerWeek: number;
  usedChargesThisWeek: number;
  balance: number; // R$
  totalSaved: number; // economy vs fuel
  joinedAt: string;
}

export type CarStatus = 'available' | 'reserved' | 'in_use' | 'maintenance';

export interface Car {
  id: string;
  model: string;
  brand: string;
  plate: string;
  batteryLevel: number; // 0-100
  autonomy: number; // km
  status: CarStatus;
  location: string;
  pricePerDay: number; // R$
  pricePerWeek: number; // R$
  image: string;
  features: string[];
  utilizationRate: number; // 0-100 %
}

export type StationStatus = 'free' | 'occupied' | 'reserved' | 'maintenance';

export interface ChargingStation {
  id: string;
  name: string;
  address: string;
  status: StationStatus;
  connectors: number;
  availableConnectors: number;
  pricePerKwh: number; // R$
  isPeak: boolean;
  lat: number;
  lng: number;
  operatingHours: string;
  utilizationRate: number;
}

export type ReservationType = 'car' | 'station';
export type ReservationStatus = 'pending' | 'active' | 'completed' | 'cancelled' | 'no_show';

export interface Reservation {
  id: string;
  userId: string;
  type: ReservationType;
  resourceId: string; // carId or stationId
  resourceName: string;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  totalCost: number;
  isFreeCharge?: boolean;
  createdAt: string;
  cancelledAt?: string;
  penalty?: number;
}

export type TransactionType = 'charge' | 'refund' | 'penalty' | 'deposit';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  reservationId?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  read: boolean;
  createdAt: string;
}

export interface AnalyticsData {
  vehicleUtilization: number;
  stationOccupancy: number;
  noShowRate: number;
  avgConsumptionPerDriver: number;
  revenuePerAsset: number;
  totalRevenue: number;
  peakHours: number[];
  weeklyRevenue: { day: string; revenue: number }[];
  assetPerformance: { name: string; utilization: number; revenue: number }[];
  insights: string[];
}

export interface PricingConfig {
  basePricePerKwh: number;
  peakMultiplier: number;
  offPeakDiscount: number;
  noShowPenalty: number;
  freeCancelHours: number;
}
