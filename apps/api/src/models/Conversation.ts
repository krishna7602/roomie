import mongoose, { Document, Schema } from 'mongoose';
import { Conversation } from '@roomie/shared';

export interface IConversationDocument extends Omit<Conversation, 'id'>, Document {
  id: string;
}

const ConversationSchema = new Schema<IConversationDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    participantIds: { type: [String], required: true, index: true },
    lastMessage: { type: String },
    lastMessageAt: { type: String },
    listingId: { type: String },
    unreadCount: { type: Number, default: 0 },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  {
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const ConversationModel =
  mongoose.models.Conversation || mongoose.model<IConversationDocument>('Conversation', ConversationSchema);
