import mongoose from 'mongoose';
import { ENV } from '../config/env';
import { createInitialSeedData } from './seed-data';
import {
  UserModel,
  ListingModel,
  SwipeModel,
  MatchModel,
  ConversationModel,
  MessageModel,
  ChoreModel,
  ExpenseModel,
} from '../models';

let isConnected = false;

export function isMongoConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

export async function connectToMongoDB(): Promise<boolean> {
  const uri = ENV.MONGODB_URI;

  if (!uri) {
    console.log('ℹ️  [MongoDB] No MONGODB_URI provided in .env');
    console.log('ℹ️  [MongoDB] Running with local JSON database fallback.');
    console.log('ℹ️  [MongoDB] To connect to MongoDB Atlas, add MONGODB_URI to apps/api/.env');
    return false;
  }

  try {
    console.log('⏳ [MongoDB] Connecting to MongoDB Atlas...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    console.log('✅ [MongoDB] Connected successfully to MongoDB Atlas!');
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Database: ${mongoose.connection.name}`);

    // Auto-seed if database is empty
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      console.log('🌱 [MongoDB] Empty database detected. Seeding initial data to Atlas...');
      await seedMongoDatabase();
      console.log('✅ [MongoDB] Initial Atlas seed completed.');
    }

    return true;
  } catch (err: any) {
    console.error('❌ [MongoDB] Connection error:', err.message);
    console.log('⚠️  [MongoDB] Falling back to local JSON database mode.');
    isConnected = false;
    return false;
  }
}

export async function seedMongoDatabase(): Promise<void> {
  const seed = createInitialSeedData();

  await Promise.all([
    UserModel.deleteMany({}),
    ListingModel.deleteMany({}),
    SwipeModel.deleteMany({}),
    MatchModel.deleteMany({}),
    ConversationModel.deleteMany({}),
    MessageModel.deleteMany({}),
    ChoreModel.deleteMany({}),
    ExpenseModel.deleteMany({}),
  ]);

  await UserModel.insertMany(seed.users);
  await ListingModel.insertMany(seed.listings);
  await SwipeModel.insertMany(seed.swipes);
  await MatchModel.insertMany(seed.matches);
  await ConversationModel.insertMany(seed.conversations);
  await MessageModel.insertMany(seed.messages);
  await ChoreModel.insertMany(seed.chores);
  await ExpenseModel.insertMany(seed.expenses);
}

export async function disconnectMongoDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
  }
}
