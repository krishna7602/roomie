import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { SafeUser } from '@roomie/shared';
import { ENV } from '../config/env';
import { UserRepository } from '../repositories/user.repository';

export interface AuthenticatedRequest extends Request {
  user?: SafeUser;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please provide a Bearer token.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as { userId: string };
    const user = UserRepository.findSafeById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User account not found or deactivated',
      });
    }

    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired authentication token',
    });
  }
}
