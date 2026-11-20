export type RentalCategory =
  | 'Bikes & Scooters'
  | 'Electronics'
  | 'Appliances'
  | 'Furniture'
  | 'Sports Equipment'
  | 'Hostel Essentials';

export type CategoryFilter = 'All' | RentalCategory;

export type DurationTier = 'Daily' | 'Weekly' | 'Monthly';

export type AvailabilityStatus = 'Available Now' | 'Booked';

export type BookingStatus =
  | 'Pending Confirmation'
  | 'Approved'
  | 'Active Rental'
  | 'Returned'
  | 'Declined';

export type AppView = 'student' | 'provider';

export type StudentTab = 'explore' | 'bookings';

export type SortOption = 'nearest' | 'price-asc' | 'price-desc';

export type ThemeMode = 'light' | 'dark';

export interface ProviderInfo {
  name: string;
  proximity: string;
  responseTime: string;
  whatsappPhone: string;
  verified: boolean;
}

export interface RentalRates {
  daily: number;
  weekly: number;
  monthly: number;
}

export interface RentalItem {
  id: string;
  title: string;
  category: RentalCategory;
  description: string;
  specs: string[];
  condition: string;
  rates: RentalRates;
  securityDeposit: number;
  distanceKm: number;
  pickupLandmark: string;
  provider: ProviderInfo;
  availability: AvailabilityStatus;
  imageUrl: string;
  ownerUid?: string;
  isPublic?: boolean;
  isCustom?: boolean;
}

export interface BookingRequest {
  requestId: string;
  itemId: string;
  itemTitle: string;
  itemCategory: RentalCategory;
  itemImage: string;
  providerName: string;
  providerPhone: string;
  providerUid?: string;
  pickupLandmark: string;
  durationTier: DurationTier;
  durationCount: number;
  unitRate: number;
  securityDeposit: number;
  estimatedRentalCost: number;
  studentUid?: string;
  studentName: string;
  hostelOrPg: string;
  studentPhone: string;
  pickupDate: string;
  notes: string;
  status: BookingStatus;
  createdAt: string;
}

export interface UserDefaults {
  defaultHostelOrPg: string;
  defaultPhone: string;
}
