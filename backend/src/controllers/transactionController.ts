import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { Transaction } from '../models/Transaction';
import { buildTransactionFilter } from '../services/filterBuilder';
import { AppError } from '../utils/AppError';
import { TransactionQueryInput } from '../validators/transactionValidators';

export const listTransactions = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as TransactionQueryInput;
  const filter = buildTransactionFilter(query);

  const skip = (query.page - 1) * query.limit;
  const sort: Record<string, 1 | -1> = { [query.sortBy]: query.sortOrder === 'asc' ? 1 : -1 };

  const [data, total] = await Promise.all([
    Transaction.find(filter).sort(sort).skip(skip).limit(query.limit).lean(),
    Transaction.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  });
});

export const getTransactionById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as { id: number };
  const transaction = await Transaction.findOne({ id }).lean();
  if (!transaction) {
    throw AppError.notFound('Transaction not found', 'TRANSACTION_NOT_FOUND');
  }
  res.status(200).json({ success: true, data: transaction });
});
