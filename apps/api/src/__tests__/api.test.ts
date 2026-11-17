import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { db } from '../db';
import { calculateRoommateCompatibility } from '@roomie/shared';

const app = createApp();

describe('Roomie Backend API Suite', () => {
  beforeEach(() => {
    // Reset DB to clean seed state before each test
    db.resetToSeed();
  });

  describe('GET /health', () => {
    it('returns 200 OK and health stats', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.stats.totalUsers).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Authentication (/api/auth)', () => {
    it('logs in an existing user with correct credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'alex@roomie.local',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('alex@roomie.local');
      expect(res.body.user.passwordHash).toBeUndefined(); // ensure password hash not leaked
    });

    it('rejects login with wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'alex@roomie.local',
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('registers a new user and returns token', async () => {
      const newUser = {
        email: 'testuser@roomie.local',
        password: 'securepassword123',
        name: 'Taylor Swift',
        age: 30,
        gender: 'female',
        occupation: 'Musician',
        targetCity: 'New York, NY',
        budgetMin: 2000,
        budgetMax: 3500,
      };

      const res = await request(app).post('/api/auth/register').send(newUser);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe(newUser.email);
      expect(res.body.token).toBeDefined();
    });

    it('gets current user profile with valid token', async () => {
      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'alex@roomie.local',
        password: 'password123',
      });
      const token = loginRes.body.token;

      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.user.name).toBe('Alex Chen');
    });

    it('updates user profile', async () => {
      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'alex@roomie.local',
        password: 'password123',
      });
      const token = loginRes.body.token;

      const updateRes = await request(app)
        .put('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .send({
          bio: 'Updated bio for testing purposes!',
          budgetMax: 2500,
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.user.bio).toBe('Updated bio for testing purposes!');
      expect(updateRes.body.user.budgetMax).toBe(2500);
    });
  });

  describe('Roommate Matching (/api/roommates)', () => {
    let tokenAlex: string;

    beforeEach(async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'alex@roomie.local',
        password: 'password123',
      });
      tokenAlex = res.body.token;
    });

    it('returns roommate candidates with compatibility scores', async () => {
      const res = await request(app)
        .get('/api/roommates/candidates')
        .set('Authorization', `Bearer ${tokenAlex}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.candidates)).toBe(true);

      // Verify candidates have compatibility scores attached
      if (res.body.candidates.length > 0) {
        const first = res.body.candidates[0];
        expect(first.compatibility).toBeDefined();
        expect(first.compatibility.score).toBeGreaterThanOrEqual(0);
        expect(first.compatibility.score).toBeLessThanOrEqual(100);
      }
    });

    it('swipes on a candidate and handles mutual match', async () => {
      // Alex likes Marcus
      const swipeRes = await request(app)
        .post('/api/roommates/swipe')
        .set('Authorization', `Bearer ${tokenAlex}`)
        .send({
          targetUserId: 'usr-5-marcus',
          direction: 'like',
        });

      expect(swipeRes.status).toBe(200);
      expect(swipeRes.body.success).toBe(true);
    });

    it('fetches existing mutual matches', async () => {
      const res = await request(app)
        .get('/api/roommates/matches')
        .set('Authorization', `Bearer ${tokenAlex}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.matches)).toBe(true);
      expect(res.body.matches.length).toBeGreaterThanOrEqual(1); // Alex and Maya match
    });
  });

  describe('Listings (/api/listings)', () => {
    it('retrieves public listings', async () => {
      const res = await request(app).get('/api/listings');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.listings.length).toBeGreaterThan(0);
      expect(res.body.listings[0].title).toBeDefined();
    });

    it('filters listings by city', async () => {
      const res = await request(app).get('/api/listings?city=San+Francisco');
      expect(res.status).toBe(200);
      expect(
        res.body.listings.every((l: any) =>
          l.location.city.toLowerCase().includes('san francisco')
        )
      ).toBe(true);
    });

    it('allows an authenticated user to create a listing', async () => {
      const loginRes = await request(app).post('/api/auth/login').send({
        email: 'alex@roomie.local',
        password: 'password123',
      });
      const token = loginRes.body.token;

      const newListing = {
        title: 'Modern Room in SoMa with Balcony',
        description: 'Sunny room in high-rise building with great amenities.',
        roomType: 'private_room',
        pricePerMonth: 1750,
        deposit: 1750,
        location: {
          address: '500 Folsom St',
          city: 'San Francisco, CA',
          neighborhood: 'SoMa',
        },
        bedrooms: 2,
        bathrooms: 2,
        amenities: ['wifi', 'gym', 'washer_dryer'],
        photos: [
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
        ],
        availableFrom: '2026-12-01',
      };

      const res = await request(app)
        .post('/api/listings')
        .set('Authorization', `Bearer ${token}`)
        .send(newListing);

      expect(res.status).toBe(201);
      expect(res.body.listing.title).toBe(newListing.title);
      expect(res.body.listing.hostId).toBe('usr-1-alex');
    });
  });

  describe('Messaging (/api/chat)', () => {
    let token: string;

    beforeEach(async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'alex@roomie.local',
        password: 'password123',
      });
      token = res.body.token;
    });

    it('lists conversations for user', async () => {
      const res = await request(app)
        .get('/api/chat/conversations')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.conversations.length).toBeGreaterThanOrEqual(1);
    });

    it('retrieves conversation messages and posts a reply', async () => {
      const convs = await request(app)
        .get('/api/chat/conversations')
        .set('Authorization', `Bearer ${token}`);
      const convId = convs.body.conversations[0].id;

      // Post message
      const postRes = await request(app)
        .post('/api/chat/conversations/messages')
        .set('Authorization', `Bearer ${token}`)
        .send({
          conversationId: convId,
          text: 'Sounds great, see you then!',
        });

      expect(postRes.status).toBe(201);
      expect(postRes.body.message.text).toBe('Sounds great, see you then!');

      // Get messages
      const getRes = await request(app)
        .get(`/api/chat/conversations/${convId}/messages`)
        .set('Authorization', `Bearer ${token}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.messages.some((m: any) => m.text === 'Sounds great, see you then!')).toBe(
        true
      );
    });
  });

  describe('Hub - Chores & Expenses (/api/hub)', () => {
    let token: string;

    beforeEach(async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'alex@roomie.local',
        password: 'password123',
      });
      token = res.body.token;
    });

    it('lists household chores and updates status', async () => {
      const res = await request(app)
        .get('/api/hub/chores')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.chores.length).toBeGreaterThan(0);

      const choreId = res.body.chores[0].id;
      const patchRes = await request(app)
        .patch(`/api/hub/chores/${choreId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'completed' });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.chore.status).toBe('completed');
    });

    it('manages shared expenses and calculates balance', async () => {
      const res = await request(app)
        .get('/api/hub/expenses')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.expenses.length).toBeGreaterThan(0);
      expect(res.body.balances).toBeDefined();

      // Create new expense
      const createRes = await request(app)
        .post('/api/hub/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Grocery Run - Trader Joe’s',
          amount: 60,
          category: 'groceries',
          splits: [
            { userId: 'usr-1-alex', amount: 30, paid: true },
            { userId: 'usr-2-maya', amount: 30, paid: false },
          ],
        });

      expect(createRes.status).toBe(201);
      expect(createRes.body.expense.amount).toBe(60);
    });
  });

  describe('Compatibility Algorithm', () => {
    it('computes high compatibility for aligned roommates', () => {
      const userA = {
        budgetMin: 1500,
        budgetMax: 2200,
        lifestyle: {
          cleanliness: 'clean' as const,
          sleepSchedule: 'early_bird' as const,
          smoking: false,
          drinking: 'socially' as const,
          pets: 'dog_friendly' as const,
          diet: 'anything' as const,
          guests: 'occasional' as const,
          workFromHome: true,
          parties: 'occasionally' as const,
          preferredRoommateGender: 'any' as const,
        },
        interests: ['Cooking', 'Fitness', 'Coffee'],
      };

      const userB = {
        budgetMin: 1600,
        budgetMax: 2400,
        lifestyle: {
          cleanliness: 'clean' as const,
          sleepSchedule: 'early_bird' as const,
          smoking: false,
          drinking: 'socially' as const,
          pets: 'dog_friendly' as const,
          diet: 'anything' as const,
          guests: 'occasional' as const,
          workFromHome: true,
          parties: 'occasionally' as const,
          preferredRoommateGender: 'any' as const,
        },
        interests: ['Cooking', 'Running', 'Coffee'],
      };

      const result = calculateRoommateCompatibility(userA, userB);
      expect(result.score).toBeGreaterThan(80);
      expect(result.budgetMatch).toBe(true);
      expect(result.cleanlinessMatch).toBe(true);
      expect(result.sharedInterests).toContain('Cooking');
      expect(result.sharedInterests).toContain('Coffee');
    });
  });
});
