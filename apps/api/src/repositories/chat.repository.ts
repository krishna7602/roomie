import { Conversation, ConversationWithParticipants, Message } from '@roomie/shared';
import { db } from '../db';
import { UserRepository } from './user.repository';
import { ConversationModel, MessageModel } from '../models';
import { isMongoConnected } from '../db/mongo';

export class ChatRepository {
  static getConversation(id: string): Conversation | undefined {
    return db.conversations.find((c) => c.id === id);
  }

  static getConversationsForUser(userId: string): ConversationWithParticipants[] {
    const userConvs = db.conversations.filter((c) => c.participantIds.includes(userId));

    return userConvs
      .map((c) => {
        const otherParticipantIds = c.participantIds.filter((pId) => pId !== userId);
        const participants = otherParticipantIds
          .map((pId) => UserRepository.findSafeById(pId))
          .filter(Boolean) as any[];

        return {
          ...c,
          participants,
        };
      })
      .sort((a, b) => {
        const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return timeB - timeA;
      });
  }

  static findDirectConversation(userA: string, userB: string): Conversation | undefined {
    return db.conversations.find(
      (c) =>
        c.participantIds.length === 2 &&
        c.participantIds.includes(userA) &&
        c.participantIds.includes(userB)
    );
  }

  static getOrCreateDirectConversation(userA: string, userB: string, listingId?: string): Conversation {
    let conv = this.findDirectConversation(userA, userB);
    if (!conv) {
      conv = {
        id: `conv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        participantIds: [userA, userB],
        listingId,
        unreadCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.conversations.push(conv);
      db.persist();

      if (isMongoConnected()) {
        ConversationModel.create(conv).catch((err) =>
          console.error('⚠️ [MongoDB] Failed to sync new conversation to Atlas:', err.message)
        );
      }
    }
    return conv;
  }

  static getMessages(conversationId: string, limit = 100): Message[] {
    return db.messages
      .filter((m) => m.conversationId === conversationId)
      .slice(-limit);
  }

  static addMessage(conversationId: string, senderId: string, text: string): Message {
    const message: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      conversationId,
      senderId,
      text,
      createdAt: new Date().toISOString(),
      read: false,
    };

    db.messages.push(message);

    const conv = this.getConversation(conversationId);
    if (conv) {
      conv.lastMessage = text;
      conv.lastMessageAt = message.createdAt;
      conv.updatedAt = message.createdAt;
    }

    db.persist();

    if (isMongoConnected()) {
      MessageModel.create(message).catch((err) =>
        console.error('⚠️ [MongoDB] Failed to sync message to Atlas:', err.message)
      );
      if (conv) {
        ConversationModel.updateOne(
          { id: conversationId },
          {
            $set: {
              lastMessage: text,
              lastMessageAt: message.createdAt,
              updatedAt: message.createdAt,
            },
          }
        ).catch((err) =>
          console.error('⚠️ [MongoDB] Failed to sync conversation update to Atlas:', err.message)
        );
      }
    }

    return message;
  }
}
