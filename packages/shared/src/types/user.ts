export type UserRole = 'user' | 'admin';

export type Gender = 'male' | 'female' | 'non_binary' | 'other' | 'prefer_not_to_say';

export type CleanlinessLevel = 'relaxed' | 'moderate' | 'clean' | 'spotless';

export type SleepSchedule = 'early_bird' | 'night_owl' | 'flexible';

export type DrinkingHabit = 'never' | 'socially' | 'regularly';

export type PetPreference =
  | 'no_pets'
  | 'has_dog'
  | 'has_cat'
  | 'dog_friendly'
  | 'cat_friendly'
  | 'allergic'
  | 'loves_all_pets';

export type DietPreference =
  | 'anything'
  | 'vegetarian'
  | 'vegan'
  | 'halal'
  | 'kosher'
  | 'pescatarian';

export type GuestHabit = 'rarely' | 'occasional' | 'weekends_only' | 'often';

export type RoommateSearchStatus =
  | 'looking_for_room'
  | 'has_room'
  | 'teaming_up'
  | 'browsing';

export interface LifestylePreferences {
  cleanliness: CleanlinessLevel;
  sleepSchedule: SleepSchedule;
  smoking: boolean;
  drinking: DrinkingHabit;
  pets: PetPreference;
  diet: DietPreference;
  guests: GuestHabit;
  workFromHome: boolean;
  parties: 'never' | 'occasionally' | 'often';
  preferredRoommateGender: 'any' | 'same_gender' | 'female_only' | 'male_only';
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  age: number;
  gender: Gender;
  occupation: string;
  universityOrCompany?: string;
  bio: string;
  avatar: string;
  photos: string[];
  searchStatus: RoommateSearchStatus;
  budgetMin: number;
  budgetMax: number;
  targetCity: string;
  targetNeighborhoods: string[];
  moveInDate: string;
  lifestyle: LifestylePreferences;
  interests: string[];
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SafeUser extends UserProfile {
  // Safe user without sensitive credentials
}

export interface UserInDatabase extends UserProfile {
  passwordHash: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthResponse {
  user: SafeUser;
  token: string;
}
