import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserInDatabase } from '@roomie/shared';
import { ENV } from '../config/env';
import { UserRepository } from '../repositories/user.repository';
import { AuthenticatedRequest } from '../middleware/auth';

function generateToken(userId: string): string {
  return jwt.sign({ userId }, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN as any,
  });
}

export class AuthController {
  static async register(req: Request, res: Response) {
    const {
      email,
      password,
      name,
      age,
      gender,
      occupation,
      targetCity,
      budgetMin,
      budgetMax,
    } = req.body;

    const existing = UserRepository.findByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email address already exists',
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const userId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newUser: UserInDatabase = {
      id: userId,
      email,
      passwordHash,
      name,
      age,
      gender,
      occupation,
      bio: `Hi, I'm ${name}! Looking for a great roommate in ${targetCity}.`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      photos: [
        `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80`,
      ],
      searchStatus: 'looking_for_room',
      budgetMin,
      budgetMax,
      targetCity,
      targetNeighborhoods: [],
      moveInDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
      lifestyle: {
        cleanliness: 'clean',
        sleepSchedule: 'early_bird',
        smoking: false,
        drinking: 'socially',
        pets: 'dog_friendly',
        diet: 'anything',
        guests: 'occasional',
        workFromHome: true,
        parties: 'occasionally',
        preferredRoommateGender: 'any',
      },
      interests: ['Fitness', 'Cooking', 'Music'],
      verified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const safeUser = UserRepository.create(newUser);
    const token = generateToken(safeUser.id);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: safeUser,
      token,
    });
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    const user = UserRepository.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    const { passwordHash: _, ...safeUser } = user;
    const token = generateToken(user.id);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      user: safeUser,
      token,
    });
  }

  static async getMe(req: AuthenticatedRequest, res: Response) {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  }

  static async updateMe(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const updated = UserRepository.update(req.user.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updated,
    });
  }
}
