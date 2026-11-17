import { SafeUser } from './user';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  listingId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationWithParticipants extends Conversation {
  participants: SafeUser[];
}

// Socket.io Events
export interface ClientToServerEvents {
  join_conversation: (data: { conversationId: string }) => void;
  leave_conversation: (data: { conversationId: string }) => void;
  send_message: (data: { conversationId: string; text: string }) => void;
  typing_start: (data: { conversationId: string }) => void;
  typing_stop: (data: { conversationId: string }) => void;
}

export interface ServerToClientEvents {
  new_message: (message: Message) => void;
  user_typing: (data: { conversationId: string; userId: string; isTyping: boolean }) => void;
  user_status: (data: { userId: string; online: boolean }) => void;
  error: (data: { message: string }) => void;
}
