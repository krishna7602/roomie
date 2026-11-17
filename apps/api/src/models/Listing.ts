import mongoose, { Document, Schema } from 'mongoose';
import { Listing } from '@roomie/shared';

export interface IListingDocument extends Omit<Listing, 'id'>, Document {
  id: string;
}

const LocationSchema = new Schema(
  {
    address: { type: String, required: true },
    city: { type: String, required: true, index: true },
    neighborhood: { type: String, required: true },
    postalCode: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
  },
  { _id: false }
);

const ListingSchema = new Schema<IListingDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    hostId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    roomType: { type: String, required: true },
    pricePerMonth: { type: Number, required: true, index: true },
    deposit: { type: Number, required: true },
    location: { type: LocationSchema, required: true },
    bedrooms: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
    amenities: { type: [String], default: [] },
    photos: { type: [String], default: [] },
    availableFrom: { type: String, required: true },
    leaseDurationMonths: { type: Number, default: 12 },
    status: { type: String, default: 'active', index: true },
    currentRoommatesCount: { type: Number, default: 0 },
    rules: { type: [String], default: [] },
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

export const ListingModel = mongoose.models.Listing || mongoose.model<IListingDocument>('Listing', ListingSchema);
