import { Response } from 'express';
import { calculateRoommateCompatibility, RoommateCandidate } from '@roomie/shared';
import { AuthenticatedRequest } from '../middleware/auth';
import { UserRepository } from '../repositories/user.repository';
import { MatchRepository } from '../repositories/match.repository';
import { ChatRepository } from '../repositories/chat.repository';

export class RoommateController {
  static async getCandidates(req: AuthenticatedRequest, res: Response) {
    const currentUser = req.user!;
    const swipedUserIds = MatchRepository.getSwipedUserIds(currentUser.id);

    // List all users except current user and users already swiped
    const allUsers = UserRepository.listAllExcept(currentUser.id);
    const unswipedUsers = allUsers.filter((u) => !swipedUserIds.includes(u.id));

    const candidates: RoommateCandidate[] = unswipedUsers.map((candidate) => {
      const compatibility = calculateRoommateCompatibility(currentUser, candidate);
      return {
        ...candidate,
        compatibility,
      };
    });

    // Sort by compatibility score descending
    candidates.sort((a, b) => b.compatibility.score - a.compatibility.score);

    return res.status(200).json({
      success: true,
      candidates,
      count: candidates.length,
    });
  }

  static async swipe(req: AuthenticatedRequest, res: Response) {
    const currentUser = req.user!;
    const { targetUserId, direction } = req.body;

    if (targetUserId === currentUser.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot swipe on yourself',
      });
    }

    const targetUser = UserRepository.findSafeById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: 'Target user not found',
      });
    }

    const result = MatchRepository.recordSwipe(currentUser.id, targetUserId, direction);

    let conversationId: string | undefined;
    if (result.isMatch) {
      // Auto-create or link conversation for mutual match
      const conv = ChatRepository.getOrCreateDirectConversation(currentUser.id, targetUserId);
      conversationId = conv.id;
      if (result.matchRecord) {
        MatchRepository.updateMatch(result.matchRecord.id, { conversationId });
      }
    }

    return res.status(200).json({
      success: true,
      direction,
      isMatch: result.isMatch,
      match: result.matchRecord,
      conversationId,
      matchedUser: result.isMatch ? targetUser : undefined,
    });
  }

  static async getMatches(req: AuthenticatedRequest, res: Response) {
    const currentUser = req.user!;
    const matches = MatchRepository.getMatchesForUser(currentUser.id);

    const matchesWithProfiles = matches.map((m) => {
      const otherUserId = m.users.find((u) => u !== currentUser.id)!;
      const otherUser = UserRepository.findSafeById(otherUserId);
      const compatibility = otherUser
        ? calculateRoommateCompatibility(currentUser, otherUser)
        : undefined;

      return {
        id: m.id,
        matchedAt: m.matchedAt,
        conversationId: m.conversationId,
        user: otherUser,
        compatibility,
      };
    });

    return res.status(200).json({
      success: true,
      matches: matchesWithProfiles,
    });
  }

  static async getRoommateById(req: AuthenticatedRequest, res: Response) {
    const currentUser = req.user!;
    const { id } = req.params;

    const user = UserRepository.findSafeById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const compatibility = calculateRoommateCompatibility(currentUser, user);

    return res.status(200).json({
      success: true,
      user: {
        ...user,
        compatibility,
      },
    });
  }
}
