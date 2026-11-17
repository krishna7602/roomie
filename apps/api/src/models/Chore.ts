import mongoose, { Document, Schema } from 'mongoose';
import { Chore } from '@roomie/shared';

export interface IChoreDocument extends Omit<Chore, 'id'>, Document {
  id: string;
}

const ChoreSchema = new Schema<IChoreDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    householdId: { type: String, required: true, index: true, default: 'default-household' },
    title: { type: String, required: true },
    description: { type: String },
    assignedToUserId: { type: String, index: true },
    dueDate: { type: String, required: true },
    frequency: { type: String, default: 'weekly' },
    status: { type: String, default: 'pending', enum: ['pending', 'completed'] },
    points: { type: Number, default: 10 },
    completedAt: { type: String },
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

export const ChoreModel = mongoose.models.Chore || mongoose.model<IChoreDocument>('Chore', ChoreSchema);
