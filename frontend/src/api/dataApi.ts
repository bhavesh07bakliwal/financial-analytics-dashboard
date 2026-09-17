import { apiClient } from './client';
import {
  Transaction,
  PaginatedResponse,
  TransactionQuery,
  DashboardSummary,
  TrendPoint,
  CategoryBreakdown,
  StatusBreakdown,
  TransactionFilters,
} from '@/types';

function cleanParams<T extends object>(params: T): Partial<T> {
  const out: Partial<T> = {};
  (Object.keys(params) as (keyof T)[]).forEach((key) => {
    const value = params[key];
    if (value !== undefined && value !== null && value !== '') {
      out[key] = value;
    }
  });
  return out;
}

export async function fetchTransactions(query: TransactionQuery): Promise<PaginatedResponse<Transaction>> {
  const res = await apiClient.get('/transactions', { params: cleanParams(query) });
  return res.data;
}

export async function fetchTransactionById(id: number): Promise<Transaction> {
  const res = await apiClient.get(`/transactions/${id}`);
  return res.data.data;
}

export async function fetchDashboardSummary(filters: TransactionFilters): Promise<DashboardSummary> {
  const res = await apiClient.get('/dashboard/summary', { params: cleanParams(filters) });
  return res.data.data;
}

export async function fetchDashboardTrends(filters: TransactionFilters): Promise<TrendPoint[]> {
  const res = await apiClient.get('/dashboard/trends', { params: cleanParams(filters) });
  return res.data.data;
}

export async function fetchCategoryBreakdown(filters: TransactionFilters): Promise<CategoryBreakdown[]> {
  const res = await apiClient.get('/dashboard/categories', { params: cleanParams(filters) });
  return res.data.data;
}

export async function fetchStatusBreakdown(filters: TransactionFilters): Promise<StatusBreakdown[]> {
  const res = await apiClient.get('/dashboard/status', { params: cleanParams(filters) });
  return res.data.data;
}
