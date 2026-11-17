import { Router } from 'express';
import { createListingSchema } from '@roomie/shared';
import { ListingController } from '../controllers/listing.controller';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validation';

const router = Router();

router.get('/', ListingController.getListings);
router.get('/user/my-listings', authenticate, ListingController.getMyListings);
router.get('/:id', ListingController.getListingById);
router.post('/', authenticate, validateBody(createListingSchema), ListingController.createListing);
router.put('/:id', authenticate, ListingController.updateListing);
router.delete('/:id', authenticate, ListingController.deleteListing);

export default router;
