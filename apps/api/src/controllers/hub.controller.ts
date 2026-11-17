import { Response } from 'express';
import { Chore, Expense } from '@roomie/shared';
import { AuthenticatedRequest } from '../middleware/auth';
import { HubRepository } from '../repositories/hub.repository';
import { UserRepository } from '../repositories/user.repository';

export class HubController {
  // Chores
  static async getChores(req: AuthenticatedRequest, res: Response) {
    const householdId = (req.query.householdId as string) || 'default-household';
    const chores = HubRepository.listChores(householdId);

    const choresWithAssignee = chores.map((c) => ({
      ...c,
      assignedUser: c.assignedToUserId ? UserRepository.findSafeById(c.assignedToUserId) : undefined,
    }));

    return res.status(200).json({
      success: true,
      chores: choresWithAssignee,
    });
  }

  static async createChore(req: AuthenticatedRequest, res: Response) {
    const body = req.body;

    const newChore: Chore = {
      id: `chr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      householdId: body.householdId || 'default-household',
      title: body.title,
      description: body.description,
      assignedToUserId: body.assignedToUserId,
      dueDate: body.dueDate,
      frequency: body.frequency || 'weekly',
      status: 'pending',
      points: body.points || 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const created = HubRepository.createChore(newChore);

    return res.status(201).json({
      success: true,
      chore: created,
    });
  }

  static async updateChoreStatus(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { status } = req.body;

    const updated = HubRepository.updateChoreStatus(id, status);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Chore not found' });
    }

    return res.status(200).json({
      success: true,
      chore: updated,
    });
  }

  static async deleteChore(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const deleted = HubRepository.deleteChore(id);

    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Chore not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Chore deleted',
    });
  }

  // Expenses
  static async getExpenses(req: AuthenticatedRequest, res: Response) {
    const householdId = (req.query.householdId as string) || 'default-household';
    const expenses = HubRepository.listExpenses(householdId);

    // Compute balance summary: who paid vs who owes
    const balances: Record<string, number> = {};

    expenses.forEach((expense) => {
      if (!expense.settled) {
        balances[expense.paidByUserId] =
          (balances[expense.paidByUserId] || 0) + expense.amount;

        expense.splits.forEach((split) => {
          if (!split.paid) {
            balances[split.userId] =
              (balances[split.userId] || 0) - split.amount;
          }
        });
      }
    });

    const expensesWithDetails = expenses.map((e) => ({
      ...e,
      paidByUser: UserRepository.findSafeById(e.paidByUserId),
      splitsWithUsers: e.splits.map((s) => ({
        ...s,
        user: UserRepository.findSafeById(s.userId),
      })),
    }));

    return res.status(200).json({
      success: true,
      expenses: expensesWithDetails,
      balances,
    });
  }

  static async createExpense(req: AuthenticatedRequest, res: Response) {
    const currentUser = req.user!;
    const body = req.body;

    const newExpense: Expense = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      householdId: body.householdId || 'default-household',
      title: body.title,
      amount: body.amount,
      category: body.category,
      paidByUserId: currentUser.id,
      splits: body.splits,
      settled: false,
      date: body.date || new Date().toISOString(),
      receiptUrl: body.receiptUrl,
      createdAt: new Date().toISOString(),
    };

    const created = HubRepository.createExpense(newExpense);

    return res.status(201).json({
      success: true,
      expense: created,
    });
  }

  static async settleExpense(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { settled = true } = req.body;

    const updated = HubRepository.settleExpense(id, settled);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }

    return res.status(200).json({
      success: true,
      expense: updated,
    });
  }
}
