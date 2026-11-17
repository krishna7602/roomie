import mongoose, { Document, Schema } from 'mongoose';
import { SwipeRecord } from '@roomie/shared';

export interface ISwipeDocument extends Omit<SwipeRecord, 'id'>, Document {
  id: string;
}

const SwipeSchema = new Schema<ISwipeDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    targetUserId: { type: String, required: true, index: true },
    direction: { type: String, required: true, enum: ['like', 'pass', 'superlike'] },
    createdAt: { type: String, default: () => new Date().toISOString() },
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

SwipeSchema.index({ userId: 1, targetUserId: 1 }, { unique: true });

export const SwipeModel = mongoose.models.Swipe || mongoose.model<ISwipeDocument>('Swipe', SwipeSchema);
