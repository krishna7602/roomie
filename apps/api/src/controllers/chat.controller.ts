import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { ChatRepository } from '../repositories/chat.repository';
import { getIO } from '../socket';

export class ChatController {
  static async getConversations(req: AuthenticatedRequest, res: Response) {
    const currentUser = req.user!;
    const conversations = ChatRepository.getConversationsForUser(currentUser.id);

    return res.status(200).json({
      success: true,
      conversations,
    });
  }

  static async getMessages(req: AuthenticatedRequest, res: Response) {
    const currentUser = req.user!;
    const { id } = req.params;

    const conversation = ChatRepository.getConversation(id);
    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    if (!conversation.participantIds.includes(currentUser.id)) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const messages = ChatRepository.getMessages(id);

    return res.status(200).json({
      success: true,
      messages,
    });
  }

  static async sendMessage(req: AuthenticatedRequest, res: Response) {
    const currentUser = req.user!;
    const { conversationId, text } = req.body;

    const conversation = ChatRepository.getConversation(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    if (!conversation.participantIds.includes(currentUser.id)) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    const message = ChatRepository.addMessage(conversationId, currentUser.id, text);

    // Broadcast in real-time via Socket.io room
    const io = getIO();
    if (io) {
      io.to(conversationId).emit('new_message', message);
    }

    return res.status(201).json({
      success: true,
      message,
    });
  }

  static async startDirectChat(req: AuthenticatedRequest, res: Response) {
    const currentUser = req.user!;
    const { targetUserId, listingId } = req.body;

    if (!targetUserId || targetUserId === currentUser.id) {
      return res.status(400).json({ success: false, error: 'Invalid target user' });
    }

    const conversation = ChatRepository.getOrCreateDirectConversation(
      currentUser.id,
      targetUserId,
      listingId
    );

    return res.status(200).json({
      success: true,
      conversation,
    });
  }
}
