import express, { Express } from 'express';
import cors from 'cors';
import { ENV } from './config/env';
import authRoutes from './routes/auth.routes';
import roommateRoutes from './routes/roommate.routes';
import listingRoutes from './routes/listing.routes';
import chatRoutes from './routes/chat.routes';
import hubRoutes from './routes/hub.routes';
import { errorHandler } from './middleware/errorHandler';
import { UserRepository } from './repositories/user.repository';
import { ListingRepository } from './repositories/listing.repository';
import { isMongoConnected } from './db/mongo';

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: ENV.CORS_ORIGIN === '*' ? true : ENV.CORS_ORIGIN,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Healthcheck & Stats Endpoint
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: isMongoConnected() ? 'mongodb-atlas' : 'local-json-fallback',
      stats: {
        totalUsers: UserRepository.count(),
        activeListings: ListingRepository.list().length,
      },
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/roommates', roommateRoutes);
  app.use('/api/listings', listingRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/hub', hubRoutes);

  // 404 Catch-all
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: 'API route not found',
    });
  });

  // Central Error Handler
  app.use(errorHandler);

  return app;
}
