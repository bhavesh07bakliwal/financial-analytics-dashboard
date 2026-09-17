import { Schema, model, Document } from 'mongoose';
import { TransactionCategory, TransactionStatus } from '../types';

export interface TransactionDocument extends Document {
  id: number;
  date: Date;
  amount: number;
  category: TransactionCategory;
  status: TransactionStatus;
  user_id: string;
  user_profile: string;
}

const transactionSchema = new Schema<TransactionDocument>(
  {
    id: { type: Number, required: true, unique: true, index: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    category: { type: String, enum: ['Revenue', 'Expense'], required: true },
    status: { type: String, enum: ['Paid', 'Pending'], required: true },
    user_id: { type: String, required: true },
    user_profile: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound + single-field indexes for the query patterns the API exposes:
// filtering by date range, category, status, user, amount range, and sorting.
transactionSchema.index({ date: -1 });
transactionSchema.index({ category: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ user_id: 1 });
transactionSchema.index({ amount: 1 });
transactionSchema.index({ category: 1, status: 1, date: -1 });

export const Transaction = model<TransactionDocument>('Transaction', transactionSchema);
