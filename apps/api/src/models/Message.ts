import mongoose, { Document, Schema } from 'mongoose';
import { Message } from '@roomie/shared';

export interface IMessageDocument extends Omit<Message, 'id'>, Document {
  id: string;
}

const MessageSchema = new Schema<IMessageDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    conversationId: { type: String, required: true, index: true },
    senderId: { type: String, required: true, index: true },
    text: { type: String, required: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
    read: { type: Boolean, default: false },
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

export const MessageModel = mongoose.models.Message || mongoose.model<IMessageDocument>('Message', MessageSchema);
