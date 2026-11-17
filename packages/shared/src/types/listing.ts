export type RoomType =
  | 'private_room'
  | 'shared_room'
  | 'entire_apartment'
  | 'studio';

export type Amenity =
  | 'wifi'
  | 'air_conditioning'
  | 'heating'
  | 'washer_dryer'
  | 'dishwasher'
  | 'furnished'
  | 'private_bathroom'
  | 'parking'
  | 'gym'
  | 'balcony'
  | 'pool'
  | 'elevator'
  | 'utilities_included'
  | 'pet_friendly'
  | 'closet_storage'
  | 'near_metro';

export type ListingStatus = 'active' | 'pending' | 'rented' | 'inactive';

export interface ListingLocation {
  address: string;
  city: string;
  neighborhood: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface Listing {
  id: string;
  hostId: string;
  title: string;
  description: string;
  roomType: RoomType;
  pricePerMonth: number;
  deposit: number;
  location: ListingLocation;
  bedrooms: number;
  bathrooms: number;
  amenities: Amenity[];
  photos: string[];
  availableFrom: string;
  leaseDurationMonths: number;
  status: ListingStatus;
  currentRoommatesCount: number;
  rules: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ListingWithHost extends Listing {
  hostName: string;
  hostAvatar: string;
  hostAge: number;
  hostOccupation: string;
  hostRating?: number;
}
