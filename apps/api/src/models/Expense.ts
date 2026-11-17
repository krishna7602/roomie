import mongoose, { Document, Schema } from 'mongoose';
import { Expense } from '@roomie/shared';

export interface IExpenseDocument extends Omit<Expense, 'id'>, Document {
  id: string;
}

const ExpenseSplitSchema = new Schema(
  {
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    paid: { type: Boolean, default: false },
  },
  { _id: false }
);

const ExpenseSchema = new Schema<IExpenseDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    householdId: { type: String, required: true, index: true, default: 'default-household' },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    paidByUserId: { type: String, required: true, index: true },
    splits: { type: [ExpenseSplitSchema], default: [] },
    settled: { type: Boolean, default: false, index: true },
    date: { type: String, default: () => new Date().toISOString() },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  {
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const ExpenseModel =
  mongoose.models.Expense || mongoose.model<IExpenseDocument>('Expense', ExpenseSchema);
