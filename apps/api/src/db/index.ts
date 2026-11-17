import fs from 'fs';
import path from 'path';
import {
  Chore,
  Conversation,
  Expense,
  Listing,
  MatchPair,
  Message,
  SwipeRecord,
  UserInDatabase,
} from '@roomie/shared';
import { ENV } from '../config/env';
import { createInitialSeedData } from './seed-data';
import { isMongoConnected } from './mongo';
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

export interface DatabaseSchema {
  users: UserInDatabase[];
  listings: Listing[];
  swipes: SwipeRecord[];
  matches: MatchPair[];
  conversations: Conversation[];
  messages: Message[];
  chores: Chore[];
  expenses: Expense[];
}

class Database {
  private data: DatabaseSchema;
  private filePath: string;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.filePath = ENV.DB_FILE;
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.warn('Could not read existing database file, re-initializing with seed data...', err);
        this.data = createInitialSeedData();
        this.saveSync();
      }
    } else {
      this.data = createInitialSeedData();
      this.saveSync();
    }
  }

  public get users(): UserInDatabase[] {
    return this.data.users;
  }

  public get listings(): Listing[] {
    return this.data.listings;
  }

  public get swipes(): SwipeRecord[] {
    return this.data.swipes;
  }

  public get matches(): MatchPair[] {
    return this.data.matches;
  }

  public get conversations(): Conversation[] {
    return this.data.conversations;
  }

  public get messages(): Message[] {
    return this.data.messages;
  }

  public get chores(): Chore[] {
    return this.data.chores;
  }

  public get expenses(): Expense[] {
    return this.data.expenses;
  }

  public resetToSeed(): void {
    this.data = createInitialSeedData();
    this.saveSync();
  }

  public async loadFromAtlas(): Promise<void> {
    if (!isMongoConnected()) return;

    try {
      const [users, listings, swipes, matches, conversations, messages, chores, expenses] =
        await Promise.all([
          UserModel.find({}).lean(),
          ListingModel.find({}).lean(),
          SwipeModel.find({}).lean(),
          MatchModel.find({}).lean(),
          ConversationModel.find({}).lean(),
          MessageModel.find({}).lean(),
          ChoreModel.find({}).lean(),
          ExpenseModel.find({}).lean(),
        ]);

      if (users.length > 0) {
        this.data.users = users as any;
        this.data.listings = listings as any;
        this.data.swipes = swipes as any;
        this.data.matches = matches as any;
        this.data.conversations = conversations as any;
        this.data.messages = messages as any;
        this.data.chores = chores as any;
        this.data.expenses = expenses as any;
        console.log(`📥 [MongoDB] Loaded ${users.length} users and ${listings.length} listings from Atlas into cache.`);
      }
    } catch (err: any) {
      console.warn('⚠️ [MongoDB] Error loading data from Atlas into local cache:', err.message);
    }
  }

  public saveSync(): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  public persist(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      try {
        this.saveSync();
      } catch (err) {
        console.error('Failed to write database to disk:', err);
      }
    }, 100);
  }
}

export const db = new Database();
