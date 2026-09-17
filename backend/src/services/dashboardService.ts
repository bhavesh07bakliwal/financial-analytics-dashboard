import { Transaction } from '../models/Transaction';
import { buildTransactionFilter, TransactionFilterInput } from './filterBuilder';

export async function getSummary(filters: TransactionFilterInput) {
  const match = buildTransactionFilter(filters);

  const [result] = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: { $cond: [{ $eq: ['$category', 'Revenue'] }, '$amount', 0] },
        },
        totalExpenses: {
          $sum: { $cond: [{ $eq: ['$category', 'Expense'] }, '$amount', 0] },
        },
        pendingCount: {
          $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] },
        },
        paidCount: {
          $sum: { $cond: [{ $eq: ['$status', 'Paid'] }, 1, 0] },
        },
        totalCount: { $sum: 1 },
      },
    },
  ]);

  const totalRevenue = result?.totalRevenue ?? 0;
  const totalExpenses = result?.totalExpenses ?? 0;

  return {
    totalRevenue,
    totalExpenses,
    netCashFlow: totalRevenue - totalExpenses,
    pendingCount: result?.pendingCount ?? 0,
    paidCount: result?.paidCount ?? 0,
    totalCount: result?.totalCount ?? 0,
  };
}

export async function getTrends(filters: TransactionFilterInput) {
  const match = buildTransactionFilter(filters);

  const rows = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: { year: { $year: '$date' }, month: { $month: '$date' }, category: '$category' },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const byPeriod = new Map<string, { period: string; revenue: number; expenses: number }>();
  for (const row of rows) {
    const period = `${row._id.year}-${String(row._id.month).padStart(2, '0')}`;
    if (!byPeriod.has(period)) {
      byPeriod.set(period, { period, revenue: 0, expenses: 0 });
    }
    const bucket = byPeriod.get(period)!;
    if (row._id.category === 'Revenue') bucket.revenue = row.total;
    else bucket.expenses = row.total;
  }

  return Array.from(byPeriod.values()).sort((a, b) => a.period.localeCompare(b.period));
}

export async function getCategoryBreakdown(filters: TransactionFilterInput) {
  const match = buildTransactionFilter(filters);

  const rows = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  return rows.map((row) => ({ category: row._id as string, total: row.total as number, count: row.count as number }));
}

export async function getStatusBreakdown(filters: TransactionFilterInput) {
  const match = buildTransactionFilter(filters);

  const rows = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$status',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

  return rows.map((row) => ({ status: row._id as string, total: row.total as number, count: row.count as number }));
}
