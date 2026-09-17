export type TransactionCategory = 'Revenue' | 'Expense';
export type TransactionStatus = 'Paid' | 'Pending';

export interface TransactionDTO {
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

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  error: {
    code: string;
    details?: unknown;
  };
}

export interface AuthTokenPayload {
  sub: string;
  email: string;
  name: string;
}

export const ALLOWED_SORT_FIELDS = ['date', 'amount', 'category', 'status', 'id', 'user_id'] as const;
export type SortField = (typeof ALLOWED_SORT_FIELDS)[number];
export type SortOrder = 'asc' | 'desc';
