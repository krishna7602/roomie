export type ChoreFrequency =
  | 'once'
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'as_needed';

export type ChoreStatus = 'pending' | 'in_progress' | 'completed';

export interface Chore {
  id: string;
  householdId: string;
  title: string;
  description?: string;
  assignedToUserId?: string;
  dueDate: string;
  frequency: ChoreFrequency;
  status: ChoreStatus;
  points: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory =
  | 'rent'
  | 'utilities'
  | 'groceries'
  | 'supplies'
  | 'internet'
  | 'furniture'
  | 'maintenance'
  | 'other';

export interface ExpenseSplit {
  userId: string;
  amount: number;
  paid: boolean;
}

export interface Expense {
  id: string;
  householdId: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  paidByUserId: string;
  splits: ExpenseSplit[];
  settled: boolean;
  date: string;
  receiptUrl?: string;
  createdAt: string;
}

export interface HouseRule {
  id: string;
  householdId: string;
  title: string;
  description: string;
  category: 'noise' | 'guests' | 'kitchen' | 'bathroom' | 'general';
}

export interface Household {
  id: string;
  name: string;
  listingId?: string;
  memberIds: string[];
  rules: HouseRule[];
  createdAt: string;
}
