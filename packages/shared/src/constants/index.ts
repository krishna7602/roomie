import { Amenity, CleanlinessLevel, DietPreference, DrinkingHabit, GuestHabit, PetPreference, SleepSchedule } from '../types';

export const AMENITIES_CONFIG: Record<Amenity, { label: string; icon: string }> = {
  wifi: { label: 'High-speed WiFi', icon: 'wifi' },
  air_conditioning: { label: 'Air Conditioning', icon: 'snowflake' },
  heating: { label: 'Heating', icon: 'flame' },
  washer_dryer: { label: 'In-unit Washer/Dryer', icon: 'washer' },
  dishwasher: { label: 'Dishwasher', icon: 'utensils' },
  furnished: { label: 'Furnished', icon: 'couch' },
  private_bathroom: { label: 'Private Bathroom', icon: 'bath' },
  parking: { label: 'Dedicated Parking', icon: 'car' },
  gym: { label: 'Fitness Center / Gym', icon: 'dumbbell' },
  balcony: { label: 'Balcony / Patio', icon: 'sun' },
  pool: { label: 'Swimming Pool', icon: 'waves' },
  elevator: { label: 'Elevator Access', icon: 'arrow-up-circle' },
  utilities_included: { label: 'All Utilities Included', icon: 'zap' },
  pet_friendly: { label: 'Pet Friendly', icon: 'paw' },
  closet_storage: { label: 'Walk-in Closet / Storage', icon: 'archive' },
  near_metro: { label: 'Near Subway / Transit', icon: 'train' },
};

export const CLEANLINESS_OPTIONS: { value: CleanlinessLevel; label: string; description: string }[] = [
  { value: 'relaxed', label: 'Relaxed', description: 'Mess is okay, cleans on weekends' },
  { value: 'moderate', label: 'Moderate', description: 'Keeps common areas tidy, flexible in room' },
  { value: 'clean', label: 'Clean', description: 'Dishes done daily, surfaces wiped down regularly' },
  { value: 'spotless', label: 'Spotless', description: 'Very neat, strict cleaning schedule' },
];

export const SLEEP_SCHEDULE_OPTIONS: { value: SleepSchedule; label: string }[] = [
  { value: 'early_bird', label: 'Early Bird (Up before 7 AM)' },
  { value: 'night_owl', label: 'Night Owl (Up past midnight)' },
  { value: 'flexible', label: 'Flexible / Varies' },
];

export const DRINKING_OPTIONS: { value: DrinkingHabit; label: string }[] = [
  { value: 'never', label: 'Non-drinker' },
  { value: 'socially', label: 'Social drinker' },
  { value: 'regularly', label: 'Regularly' },
];

export const PETS_OPTIONS: { value: PetPreference; label: string }[] = [
  { value: 'no_pets', label: 'No pets / allergic' },
  { value: 'has_dog', label: 'I have a dog' },
  { value: 'has_cat', label: 'I have a cat' },
  { value: 'dog_friendly', label: 'Dog friendly' },
  { value: 'cat_friendly', label: 'Cat friendly' },
  { value: 'loves_all_pets', label: 'Love all animals' },
  { value: 'allergic', label: 'Allergic to pets' },
];

export const DIET_OPTIONS: { value: DietPreference; label: string }[] = [
  { value: 'anything', label: 'Omnivore / Anything' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
  { value: 'pescatarian', label: 'Pescatarian' },
];

export const GUESTS_OPTIONS: { value: GuestHabit; label: string }[] = [
  { value: 'rarely', label: 'Rarely host guests' },
  { value: 'occasional', label: 'Occasional dinner / study group' },
  { value: 'weekends_only', label: 'Weekend visitors only' },
  { value: 'often', label: 'Social house / frequent guests' },
];

export const POPULAR_INTERESTS: string[] = [
  'Cooking', 'Fitness', 'Gaming', 'Reading', 'Music', 'Photography',
  'Hiking', 'Yoga', 'Movies & Netflix', 'Tech & Coding', 'Art & Design',
  'Board Games', 'Coffee', 'Travel', 'Podcasts', 'Biking'
];

export const POPULAR_CITIES: string[] = [
  'San Francisco, CA',
  'New York, NY',
  'Austin, TX',
  'Seattle, WA',
  'Boston, MA',
  'Chicago, IL',
  'Los Angeles, CA',
  'Toronto, ON'
];
