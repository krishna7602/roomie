import { SafeUser, UserInDatabase } from '@roomie/shared';
import { db } from '../db';
import { UserModel } from '../models';
import { isMongoConnected } from '../db/mongo';

export function toSafeUser(user: UserInDatabase): SafeUser {
  const { passwordHash: _, ...safe } = user;
  return safe;
}

export class UserRepository {
  static findById(id: string): UserInDatabase | undefined {
    return db.users.find((u) => u.id === id);
  }

  static findSafeById(id: string): SafeUser | undefined {
    const user = this.findById(id);
    return user ? toSafeUser(user) : undefined;
  }

  static findByEmail(email: string): UserInDatabase | undefined {
    return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  static create(user: UserInDatabase): SafeUser {
    db.users.push(user);
    db.persist();

    if (isMongoConnected()) {
      UserModel.create(user).catch((err) =>
        console.error('⚠️ [MongoDB] Failed to sync new user to Atlas:', err.message)
      );
    }

    return toSafeUser(user);
  }

  static update(id: string, partial: Partial<UserInDatabase>): SafeUser | undefined {
    const index = db.users.findIndex((u) => u.id === id);
    if (index === -1) return undefined;

    db.users[index] = {
      ...db.users[index],
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    db.persist();

    if (isMongoConnected()) {
      UserModel.updateOne(
        { id },
        { $set: partial, updatedAt: db.users[index].updatedAt }
      ).catch((err) =>
        console.error('⚠️ [MongoDB] Failed to sync user update to Atlas:', err.message)
      );
    }

    return toSafeUser(db.users[index]);
  }

  static listAllExcept(userId: string): SafeUser[] {
    return db.users.filter((u) => u.id !== userId).map(toSafeUser);
  }

  static count(): number {
    return db.users.length;
  }
}
