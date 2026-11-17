import { Chore, ChoreStatus, Expense } from '@roomie/shared';
import { db } from '../db';
import { ChoreModel, ExpenseModel } from '../models';
import { isMongoConnected } from '../db/mongo';

export class HubRepository {
  // Chores
  static listChores(householdId = 'default-household'): Chore[] {
    return db.chores.filter((c) => c.householdId === householdId);
  }

  static findChoreById(id: string): Chore | undefined {
    return db.chores.find((c) => c.id === id);
  }

  static createChore(chore: Chore): Chore {
    db.chores.push(chore);
    db.persist();

    if (isMongoConnected()) {
      ChoreModel.create(chore).catch((err) =>
        console.error('⚠️ [MongoDB] Failed to sync chore to Atlas:', err.message)
      );
    }

    return chore;
  }

  static updateChoreStatus(id: string, status: ChoreStatus): Chore | undefined {
    const chore = this.findChoreById(id);
    if (!chore) return undefined;

    chore.status = status;
    if (status === 'completed') {
      chore.completedAt = new Date().toISOString();
    } else {
      delete chore.completedAt;
    }
    chore.updatedAt = new Date().toISOString();
    db.persist();

    if (isMongoConnected()) {
      ChoreModel.updateOne(
        { id },
        {
          $set: {
            status,
            completedAt: chore.completedAt,
            updatedAt: chore.updatedAt,
          },
        }
      ).catch((err) =>
        console.error('⚠️ [MongoDB] Failed to sync chore update to Atlas:', err.message)
      );
    }

    return chore;
  }

  static deleteChore(id: string): boolean {
    const idx = db.chores.findIndex((c) => c.id === id);
    if (idx === -1) return false;

    db.chores.splice(idx, 1);
    db.persist();

    if (isMongoConnected()) {
      ChoreModel.deleteOne({ id }).catch((err) =>
        console.error('⚠️ [MongoDB] Failed to sync chore delete to Atlas:', err.message)
      );
    }

    return true;
  }

  // Expenses
  static listExpenses(householdId = 'default-household'): Expense[] {
    return db.expenses
      .filter((e) => e.householdId === householdId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static findExpenseById(id: string): Expense | undefined {
    return db.expenses.find((e) => e.id === id);
  }

  static createExpense(expense: Expense): Expense {
    db.expenses.push(expense);
    db.persist();

    if (isMongoConnected()) {
      ExpenseModel.create(expense).catch((err) =>
        console.error('⚠️ [MongoDB] Failed to sync expense to Atlas:', err.message)
      );
    }

    return expense;
  }

  static settleExpense(id: string, settled: boolean): Expense | undefined {
    const expense = this.findExpenseById(id);
    if (!expense) return undefined;

    expense.settled = settled;
    expense.splits = expense.splits.map((s) => ({ ...s, paid: settled }));
    db.persist();

    if (isMongoConnected()) {
      ExpenseModel.updateOne(
        { id },
        {
          $set: {
            settled,
            splits: expense.splits,
          },
        }
      ).catch((err) =>
        console.error('⚠️ [MongoDB] Failed to sync expense settle to Atlas:', err.message)
      );
    }

    return expense;
  }
}
