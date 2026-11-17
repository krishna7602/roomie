import { Request, Response } from 'express';
import { Listing } from '@roomie/shared';
import { AuthenticatedRequest } from '../middleware/auth';
import { ListingRepository } from '../repositories/listing.repository';

export class ListingController {
  static async getListings(req: Request, res: Response) {
    const { city, minPrice, maxPrice, roomType, search, amenities } = req.query;

    const filter = {
      city: typeof city === 'string' ? city : undefined,
      minPrice: minPrice ? parseInt(minPrice as string, 10) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice as string, 10) : undefined,
      roomType: typeof roomType === 'string' ? roomType : undefined,
      search: typeof search === 'string' ? search : undefined,
      amenities: typeof amenities === 'string' ? amenities.split(',') : undefined,
    };

    const listings = ListingRepository.list(filter);

    return res.status(200).json({
      success: true,
      listings,
      count: listings.length,
    });
  }

  static async getListingById(req: Request, res: Response) {
    const { id } = req.params;
    const listing = ListingRepository.findWithHost(id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: 'Listing not found',
      });
    }

    return res.status(200).json({
      success: true,
      listing,
    });
  }

  static async createListing(req: AuthenticatedRequest, res: Response) {
    const currentUser = req.user!;
    const body = req.body;

    const newListing: Listing = {
      id: `lst-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      hostId: currentUser.id,
      title: body.title,
      description: body.description,
      roomType: body.roomType,
      pricePerMonth: body.pricePerMonth,
      deposit: body.deposit,
      location: body.location,
      bedrooms: body.bedrooms,
      bathrooms: body.bathrooms,
      amenities: body.amenities,
      photos: body.photos,
      availableFrom: body.availableFrom,
      leaseDurationMonths: body.leaseDurationMonths || 12,
      status: 'active',
      currentRoommatesCount: body.currentRoommatesCount || 0,
      rules: body.rules || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const created = ListingRepository.create(newListing);

    return res.status(201).json({
      success: true,
      message: 'Listing posted successfully',
      listing: created,
    });
  }

  static async updateListing(req: AuthenticatedRequest, res: Response) {
    const currentUser = req.user!;
    const { id } = req.params;

    const existing = ListingRepository.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    if (existing.hostId !== currentUser.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized to edit this listing' });
    }

    const updated = ListingRepository.update(id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Listing updated successfully',
      listing: updated,
    });
  }

  static async deleteListing(req: AuthenticatedRequest, res: Response) {
    const currentUser = req.user!;
    const { id } = req.params;

    const existing = ListingRepository.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    if (existing.hostId !== currentUser.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized to delete this listing' });
    }

    ListingRepository.delete(id);

    return res.status(200).json({
      success: true,
      message: 'Listing deleted successfully',
    });
  }

  static async getMyListings(req: AuthenticatedRequest, res: Response) {
    const currentUser = req.user!;
    const listings = ListingRepository.findByHostId(currentUser.id);

    return res.status(200).json({
      success: true,
      listings,
    });
  }
}
