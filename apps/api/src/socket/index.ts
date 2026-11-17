import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Server as HTTPServer } from 'http';
import { ENV } from '../config/env';
import { UserRepository } from '../repositories/user.repository';
import { ChatRepository } from '../repositories/chat.repository';

let ioInstance: SocketIOServer | null = null;
const onlineUsers = new Map<string, string>(); // userId -> socketId

export function getIO(): SocketIOServer | null {
  return ioInstance;
}

export function initSocketIO(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: ENV.CORS_ORIGIN === '*' ? '*' : ENV.CORS_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  ioInstance = io;

  // Socket middleware for JWT authentication
  io.use((socket: Socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      // Allow unauthenticated connection or reject:
      return next();
    }

    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET) as { userId: string };
      socket.data.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;

    if (userId) {
      onlineUsers.set(userId, socket.id);
      io.emit('user_status', { userId, online: true });
    }

    // Join specific conversation room
    socket.on('join_conversation', ({ conversationId }: { conversationId: string }) => {
      socket.join(conversationId);
    });

    // Leave conversation room
    socket.on('leave_conversation', ({ conversationId }: { conversationId: string }) => {
      socket.leave(conversationId);
    });

    // Send real-time chat message
    socket.on(
      'send_message',
      ({ conversationId, text }: { conversationId: string; text: string }) => {
        const senderId = socket.data.userId || 'anon';
        const message = ChatRepository.addMessage(conversationId, senderId, text);
        io.to(conversationId).emit('new_message', message);
      }
    );

    // Typing indicators
    socket.on('typing_start', ({ conversationId }: { conversationId: string }) => {
      socket.to(conversationId).emit('user_typing', {
        conversationId,
        userId: socket.data.userId || 'anonymous',
        isTyping: true,
      });
    });

    socket.on('typing_stop', ({ conversationId }: { conversationId: string }) => {
      socket.to(conversationId).emit('user_typing', {
        conversationId,
        userId: socket.data.userId || 'anonymous',
        isTyping: false,
      });
    });

    socket.on('disconnect', () => {
      if (userId) {
        onlineUsers.delete(userId);
        io.emit('user_status', { userId, online: false });
      }
    });
  });

  return io;
}
