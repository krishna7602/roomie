import { MatchPair, SwipeDirection, SwipeRecord } from '@roomie/shared';
import { db } from '../db';
import { SwipeModel, MatchModel } from '../models';
import { isMongoConnected } from '../db/mongo';

export class MatchRepository {
  static getSwipe(userId: string, targetUserId: string): SwipeRecord | undefined {
    return db.swipes.find((s) => s.userId === userId && s.targetUserId === targetUserId);
  }

  static recordSwipe(
    userId: string,
    targetUserId: string,
    direction: SwipeDirection
  ): { swipe: SwipeRecord; isMatch: boolean; matchRecord?: MatchPair } {
    let swipe = this.getSwipe(userId, targetUserId);
    if (swipe) {
      swipe.direction = direction;
    } else {
      swipe = {
        id: `swp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        userId,
        targetUserId,
        direction,
        createdAt: new Date().toISOString(),
      };
      db.swipes.push(swipe);
    }

    let isMatch = false;
    let matchRecord: MatchPair | undefined;

    if (direction === 'like' || direction === 'superlike') {
      const reverseSwipe = db.swipes.find(
        (s) =>
          s.userId === targetUserId &&
          s.targetUserId === userId &&
          (s.direction === 'like' || s.direction === 'superlike')
      );

      if (reverseSwipe) {
        const existingMatch = db.matches.find(
          (m) =>
            (m.users[0] === userId && m.users[1] === targetUserId) ||
            (m.users[0] === targetUserId && m.users[1] === userId)
        );

        if (!existingMatch) {
          matchRecord = {
            id: `match-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            users: [userId, targetUserId],
            matchedAt: new Date().toISOString(),
          };
          db.matches.push(matchRecord);
          isMatch = true;
        } else {
          matchRecord = existingMatch;
          isMatch = true;
        }
      }
    }

    db.persist();

    if (isMongoConnected()) {
      SwipeModel.updateOne({ id: swipe.id }, { $set: swipe }, { upsert: true }).catch((err) =>
        console.error('⚠️ [MongoDB] Failed to sync swipe to Atlas:', err.message)
      );
      if (matchRecord) {
        MatchModel.updateOne({ id: matchRecord.id }, { $set: matchRecord }, { upsert: true }).catch(
          (err) => console.error('⚠️ [MongoDB] Failed to sync match to Atlas:', err.message)
        );
      }
    }

    return { swipe, isMatch, matchRecord };
  }

  static getSwipedUserIds(userId: string): string[] {
    return db.swipes.filter((s) => s.userId === userId).map((s) => s.targetUserId);
  }

  static getMatchesForUser(userId: string): MatchPair[] {
    return db.matches.filter((m) => m.users.includes(userId));
  }

  static updateMatch(id: string, partial: Partial<MatchPair>): MatchPair | undefined {
    const match = db.matches.find((m) => m.id === id);
    if (!match) return undefined;
    Object.assign(match, partial);
    db.persist();

    if (isMongoConnected()) {
      MatchModel.updateOne({ id }, { $set: partial }).catch((err) =>
        console.error('⚠️ [MongoDB] Failed to sync match update to Atlas:', err.message)
      );
    }

    return match;
  }
}
