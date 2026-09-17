import { FilterQuery } from 'mongoose';
import { TransactionDocument } from '../models/Transaction';

export interface TransactionFilterInput {
  search?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  category?: 'Revenue' | 'Expense';
  status?: 'Paid' | 'Pending';
  userId?: string;
}

/**
 * Builds a safe Mongo filter object from validated, whitelisted user input.
 * Never interpolates raw user strings into operators - only into $regex on
 * known string fields, and only after they've passed Zod validation upstream.
 */
export function buildTransactionFilter(input: TransactionFilterInput): FilterQuery<TransactionDocument> {
  const filter: FilterQuery<TransactionDocument> = {};

  if (input.category) filter.category = input.category;
  if (input.status) filter.status = input.status;
  if (input.userId) filter.user_id = input.userId;

  if (input.startDate || input.endDate) {
    filter.date = {};
    if (input.startDate) filter.date.$gte = new Date(input.startDate);
    if (input.endDate) filter.date.$lte = new Date(input.endDate);
  }

  if (input.minAmount !== undefined || input.maxAmount !== undefined) {
    filter.amount = {};
    if (input.minAmount !== undefined) filter.amount.$gte = input.minAmount;
    if (input.maxAmount !== undefined) filter.amount.$lte = input.maxAmount;
  }

  if (input.search) {
    const escaped = input.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    const orClauses: FilterQuery<TransactionDocument>[] = [
      { user_id: regex },
      { category: regex },
      { status: regex },
    ];
    const numericSearch = Number(input.search);
    if (!Number.isNaN(numericSearch)) {
      orClauses.push({ id: numericSearch });
      orClauses.push({ amount: numericSearch });
    }
    filter.$or = orClauses;
  }

  return filter;
}
