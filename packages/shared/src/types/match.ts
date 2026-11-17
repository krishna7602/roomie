import { SafeUser } from './user';

export type SwipeDirection = 'like' | 'pass' | 'superlike';

export interface SwipeRecord {
  id: string;
  userId: string;
  targetUserId: string;
  direction: SwipeDirection;
  createdAt: string;
}

export interface MatchPair {
  id: string;
  users: [string, string];
  matchedAt: string;
  conversationId?: string;
}

export interface CompatibilityScore {
  score: number; // 0 - 100
  budgetMatch: boolean;
  cleanlinessMatch: boolean;
  sleepScheduleMatch: boolean;
  habitsMatch: boolean;
  sharedInterests: string[];
  notes: string[];
}

export interface RoommateCandidate extends SafeUser {
  compatibility: CompatibilityScore;
}
