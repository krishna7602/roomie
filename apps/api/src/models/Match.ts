import mongoose, { Document, Schema } from 'mongoose';
import { MatchPair } from '@roomie/shared';

export interface IMatchDocument extends Omit<MatchPair, 'id'>, Document {
  id: string;
}

const MatchSchema = new Schema<IMatchDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    users: { type: [String], required: true, index: true },
    matchedAt: { type: String, default: () => new Date().toISOString() },
    conversationId: { type: String },
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

export const MatchModel = mongoose.models.Match || mongoose.model<IMatchDocument>('Match', MatchSchema);
