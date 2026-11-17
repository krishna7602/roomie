import { CompatibilityScore } from '../types/match';
import { UserProfile } from '../types/user';

export function calculateRoommateCompatibility(
  userA: Pick<UserProfile, 'budgetMin' | 'budgetMax' | 'lifestyle' | 'interests'>,
  userB: Pick<UserProfile, 'budgetMin' | 'budgetMax' | 'lifestyle' | 'interests'>
): CompatibilityScore {
  let score = 50; // base score
  const notes: string[] = [];

  // 1. Budget Overlap Check (Weight: 25)
  const budgetOverlap =
    userA.budgetMin <= userB.budgetMax && userA.budgetMax >= userB.budgetMin;
  if (budgetOverlap) {
    score += 20;
    notes.push('Budget ranges align nicely');
  } else {
    score -= 15;
    notes.push('Budget mismatch');
  }

  // 2. Cleanliness Match (Weight: 20)
  const cleanLevels = ['relaxed', 'moderate', 'clean', 'spotless'];
  const diffClean = Math.abs(
    cleanLevels.indexOf(userA.lifestyle.cleanliness) -
      cleanLevels.indexOf(userB.lifestyle.cleanliness)
  );

  let cleanlinessMatch = false;
  if (diffClean === 0) {
    score += 15;
    cleanlinessMatch = true;
    notes.push('Identical cleanliness standards');
  } else if (diffClean === 1) {
    score += 8;
    cleanlinessMatch = true;
  } else {
    score -= 10;
    notes.push('Noticeably different cleaning habits');
  }

  // 3. Sleep Schedule (Weight: 15)
  let sleepScheduleMatch = false;
  if (
    userA.lifestyle.sleepSchedule === userB.lifestyle.sleepSchedule ||
    userA.lifestyle.sleepSchedule === 'flexible' ||
    userB.lifestyle.sleepSchedule === 'flexible'
  ) {
    score += 10;
    sleepScheduleMatch = true;
    notes.push('Compatible sleep schedules');
  } else {
    score -= 5;
    notes.push('Different sleep rhythms (early bird vs night owl)');
  }

  // 4. Smoking Dealbreaker (Weight: 15)
  let habitsMatch = true;
  if (userA.lifestyle.smoking !== userB.lifestyle.smoking) {
    score -= 15;
    habitsMatch = false;
    notes.push('Differing smoking preferences');
  } else {
    score += 5;
  }

  // 5. Shared Interests (Weight: 10)
  const sharedInterests = (userA.interests || []).filter((interest) =>
    (userB.interests || []).includes(interest)
  );

  if (sharedInterests.length > 0) {
    const bonus = Math.min(15, sharedInterests.length * 4);
    score += bonus;
    notes.push(`${sharedInterests.length} shared interest(s) in common`);
  }

  // 6. Pets & Guests
  if (
    (userA.lifestyle.pets === 'allergic' && userB.lifestyle.pets.includes('has_')) ||
    (userB.lifestyle.pets === 'allergic' && userA.lifestyle.pets.includes('has_'))
  ) {
    score -= 25;
    notes.push('Pet allergy conflict');
  }

  // Clamp score between 10 and 99
  const finalScore = Math.max(10, Math.min(99, Math.round(score)));

  return {
    score: finalScore,
    budgetMatch: budgetOverlap,
    cleanlinessMatch,
    sleepScheduleMatch,
    habitsMatch,
    sharedInterests,
    notes,
  };
}
