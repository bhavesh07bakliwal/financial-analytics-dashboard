export type TransactionCategory = 'Revenue' | 'Expense';
export type TransactionStatus = 'Paid' | 'Pending';

export interface Transaction {
  id: number;
  date: string;
  amount: number;
  category: TransactionCategory;
  status: TransactionStatus;
  user_id: string;
  user_profile: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: PaginationMeta;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface DashboardSummary {
  totalRevenue: number;
  totalExpenses: number;
  netCashFlow: number;
  pendingCount: number;
  paidCount: number;
  totalCount: number;
}

export interface TrendPoint {
  period: string;
  revenue: number;
  expenses: number;
}

export interface CategoryBreakdown {
  category: TransactionCategory;
  total: number;
  count: number;
}

export interface StatusBreakdown {
  status: TransactionStatus;
  total: number;
  count: number;
}

export type SortField = 'date' | 'amount' | 'category' | 'status' | 'id' | 'user_id';
export type SortOrder = 'asc' | 'desc';

export interface TransactionFilters {
  search?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  category?: TransactionCategory;
  status?: TransactionStatus;
  userId?: string;
}

export interface TransactionQuery extends TransactionFilters {
  page: number;
  limit: number;
  sortBy: SortField;
  sortOrder: SortOrder;
}

export const EXPORTABLE_FIELDS = ['id', 'date', 'amount', 'category', 'status', 'user_id', 'user_profile'] as const;
export type ExportableField = (typeof EXPORTABLE_FIELDS)[number];

export interface ExportConfig {
  columns: ExportableField[];
  filters: TransactionFilters;
}

export interface APIError {
  success: false;
  message: string;
  error: {
    code: string;
    details?: unknown;
  };
}
