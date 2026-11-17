import { Listing, ListingWithHost } from '@roomie/shared';
import { db } from '../db';
import { UserRepository } from './user.repository';
import { ListingModel } from '../models';
import { isMongoConnected } from '../db/mongo';

export interface ListingFilter {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  roomType?: string;
  amenities?: string[];
  search?: string;
}

export class ListingRepository {
  static findById(id: string): Listing | undefined {
    return db.listings.find((l) => l.id === id);
  }

  static findWithHost(id: string): ListingWithHost | undefined {
    const listing = this.findById(id);
    if (!listing) return undefined;

    const host = UserRepository.findSafeById(listing.hostId);
    return {
      ...listing,
      hostName: host ? host.name : 'Unknown Host',
      hostAvatar: host ? host.avatar : '',
      hostAge: host ? host.age : 25,
      hostOccupation: host ? host.occupation : 'Professional',
      hostRating: 4.9,
    };
  }

  static list(filter?: ListingFilter): ListingWithHost[] {
    let result = db.listings.filter((l) => l.status === 'active');

    if (filter) {
      if (filter.city) {
        const cityLower = filter.city.toLowerCase();
        result = result.filter((l) => l.location.city.toLowerCase().includes(cityLower));
      }
      if (filter.minPrice !== undefined) {
        result = result.filter((l) => l.pricePerMonth >= filter.minPrice!);
      }
      if (filter.maxPrice !== undefined) {
        result = result.filter((l) => l.pricePerMonth <= filter.maxPrice!);
      }
      if (filter.roomType) {
        result = result.filter((l) => l.roomType === filter.roomType);
      }
      if (filter.amenities && filter.amenities.length > 0) {
        result = result.filter((l) =>
          filter.amenities!.every((a) => (l.amenities as string[]).includes(a))
        );
      }
      if (filter.search) {
        const s = filter.search.toLowerCase();
        result = result.filter(
          (l) =>
            l.title.toLowerCase().includes(s) ||
            l.description.toLowerCase().includes(s) ||
            l.location.neighborhood.toLowerCase().includes(s)
        );
      }
    }

    return result.map((listing) => {
      const host = UserRepository.findSafeById(listing.hostId);
      return {
        ...listing,
        hostName: host ? host.name : 'Roomie Host',
        hostAvatar: host ? host.avatar : '',
        hostAge: host ? host.age : 25,
        hostOccupation: host ? host.occupation : 'Professional',
        hostRating: 4.9,
      };
    });
  }

  static findByHostId(hostId: string): Listing[] {
    return db.listings.filter((l) => l.hostId === hostId);
  }

  static create(listing: Listing): Listing {
    db.listings.push(listing);
    db.persist();

    if (isMongoConnected()) {
      ListingModel.create(listing).catch((err) =>
        console.error('⚠️ [MongoDB] Failed to sync new listing to Atlas:', err.message)
      );
    }

    return listing;
  }

  static update(id: string, partial: Partial<Listing>): Listing | undefined {
    const idx = db.listings.findIndex((l) => l.id === id);
    if (idx === -1) return undefined;

    db.listings[idx] = {
      ...db.listings[idx],
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    db.persist();

    if (isMongoConnected()) {
      ListingModel.updateOne(
        { id },
        { $set: partial, updatedAt: db.listings[idx].updatedAt }
      ).catch((err) =>
        console.error('⚠️ [MongoDB] Failed to sync listing update to Atlas:', err.message)
      );
    }

    return db.listings[idx];
  }

  static delete(id: string): boolean {
    const idx = db.listings.findIndex((l) => l.id === id);
    if (idx === -1) return false;

    db.listings.splice(idx, 1);
    db.persist();

    if (isMongoConnected()) {
      ListingModel.deleteOne({ id }).catch((err) =>
        console.error('⚠️ [MongoDB] Failed to sync listing delete to Atlas:', err.message)
      );
    }

    return true;
  }
}
