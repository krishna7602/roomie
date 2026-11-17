import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().int().min(18, 'Must be at least 18 years old').max(100),
  gender: z.enum(['male', 'female', 'non_binary', 'other', 'prefer_not_to_say']),
  occupation: z.string().min(1, 'Occupation is required'),
  targetCity: z.string().min(1, 'Target city is required'),
  budgetMin: z.number().nonnegative(),
  budgetMax: z.number().positive(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export const lifestyleSchema = z.object({
  cleanliness: z.enum(['relaxed', 'moderate', 'clean', 'spotless']),
  sleepSchedule: z.enum(['early_bird', 'night_owl', 'flexible']),
  smoking: z.boolean(),
  drinking: z.enum(['never', 'socially', 'regularly']),
  pets: z.enum([
    'no_pets',
    'has_dog',
    'has_cat',
    'dog_friendly',
    'cat_friendly',
    'allergic',
    'loves_all_pets',
  ]),
  diet: z.enum(['anything', 'vegetarian', 'vegan', 'halal', 'kosher', 'pescatarian']),
  guests: z.enum(['rarely', 'occasional', 'weekends_only', 'often']),
  workFromHome: z.boolean(),
  parties: z.enum(['never', 'occasionally', 'often']),
  preferredRoommateGender: z.enum(['any', 'same_gender', 'female_only', 'male_only']),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
  age: z.number().int().min(18).max(100).optional(),
  gender: z.enum(['male', 'female', 'non_binary', 'other', 'prefer_not_to_say']).optional(),
  occupation: z.string().optional(),
  universityOrCompany: z.string().optional(),
  avatar: z.string().url().or(z.string()).optional(),
  photos: z.array(z.string()).optional(),
  searchStatus: z.enum(['looking_for_room', 'has_room', 'teaming_up', 'browsing']).optional(),
  budgetMin: z.number().nonnegative().optional(),
  budgetMax: z.number().positive().optional(),
  targetCity: z.string().optional(),
  targetNeighborhoods: z.array(z.string()).optional(),
  moveInDate: z.string().optional(),
  lifestyle: lifestyleSchema.partial().optional(),
  interests: z.array(z.string()).optional(),
});

export const createListingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  roomType: z.enum(['private_room', 'shared_room', 'entire_apartment', 'studio']),
  pricePerMonth: z.number().positive('Price must be greater than 0'),
  deposit: z.number().nonnegative(),
  location: z.object({
    address: z.string().min(3),
    city: z.string().min(2),
    neighborhood: z.string().min(2),
    postalCode: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
  bedrooms: z.number().int().min(1),
  bathrooms: z.number().min(0.5),
  amenities: z.array(z.string()),
  photos: z.array(z.string()).min(1, 'Please provide at least one photo'),
  availableFrom: z.string(),
  leaseDurationMonths: z.number().int().positive().default(12),
  currentRoommatesCount: z.number().int().nonnegative().default(0),
  rules: z.array(z.string()).default([]),
});

export const swipeActionSchema = z.object({
  targetUserId: z.string().uuid().or(z.string()),
  direction: z.enum(['like', 'pass', 'superlike']),
});

export const sendMessageSchema = z.object({
  conversationId: z.string(),
  text: z.string().min(1, 'Message cannot be empty'),
});

export const createChoreSchema = z.object({
  householdId: z.string().default('default-household'),
  title: z.string().min(2),
  description: z.string().optional(),
  assignedToUserId: z.string().optional(),
  dueDate: z.string(),
  frequency: z.enum(['once', 'daily', 'weekly', 'biweekly', 'monthly', 'as_needed']).default('weekly'),
  points: z.number().int().nonnegative().default(10),
});

export const updateChoreSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  assignedToUserId: z.string().optional(),
  dueDate: z.string().optional(),
});

export const createExpenseSchema = z.object({
  householdId: z.string().default('default-household'),
  title: z.string().min(2),
  amount: z.number().positive(),
  category: z.enum(['rent', 'utilities', 'groceries', 'supplies', 'internet', 'furniture', 'maintenance', 'other']),
  splits: z.array(
    z.object({
      userId: z.string(),
      amount: z.number().positive(),
      paid: z.boolean().default(false),
    })
  ).min(1),
  receiptUrl: z.string().optional(),
  date: z.string().default(() => new Date().toISOString()),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type SwipeActionInput = z.infer<typeof swipeActionSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CreateChoreInput = z.infer<typeof createChoreSchema>;
export type UpdateChoreInput = z.infer<typeof updateChoreSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
