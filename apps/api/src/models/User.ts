import mongoose, { Document, Schema } from 'mongoose';
import { UserInDatabase } from '@roomie/shared';

export interface IUserDocument extends Omit<UserInDatabase, 'id'>, Document {
  id: string;
}

const LifestyleSchema = new Schema(
  {
    cleanliness: { type: String, default: 'moderate' },
    sleepSchedule: { type: String, default: 'flexible' },
    smoking: { type: Schema.Types.Mixed, default: false },
    drinking: { type: String, default: 'socially' },
    pets: { type: String, default: 'no_pets' },
    diet: { type: String, default: 'no_preference' },
    guests: { type: String, default: 'occasionally' },
    workFromHome: { type: Schema.Types.Mixed, default: 'hybrid' },
    parties: { type: String, default: 'rarely' },
    preferredRoommateGender: { type: String, default: 'any' },
  },
  { _id: false }
);

const UserSchema = new Schema<IUserDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    occupation: { type: String, default: 'Professional' },
    universityOrCompany: { type: String },
    bio: { type: String, default: '' },
    avatar: { type: String, default: '' },
    photos: { type: [String], default: [] },
    searchStatus: { type: String, default: 'looking_for_room' },
    budgetMin: { type: Number, default: 1000 },
    budgetMax: { type: Number, default: 2500 },
    targetCity: { type: String, required: true },
    targetNeighborhoods: { type: [String], default: [] },
    moveInDate: { type: String },
    lifestyle: { type: LifestyleSchema, default: () => ({}) },
    interests: { type: [String], default: [] },
    verified: { type: Boolean, default: false },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  {
    timestamps: false,
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

export const UserModel = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
