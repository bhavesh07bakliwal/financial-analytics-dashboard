import { useQuery } from '@tanstack/react-query';
import {
  fetchTransactions,
  fetchDashboardSummary,
  fetchDashboardTrends,
  fetchCategoryBreakdown,
  fetchStatusBreakdown,
} from '@/api/dataApi';
import { TransactionFilters, TransactionQuery } from '@/types';

export function useTransactionsQuery(query: TransactionQuery) {
  return useQuery({
    queryKey: ['transactions', query],
    queryFn: () => fetchTransactions(query),
    placeholderData: (prev) => prev,
  });
}

export function useDashboardSummaryQuery(filters: TransactionFilters) {
  return useQuery({
    queryKey: ['dashboard', 'summary', filters],
    queryFn: () => fetchDashboardSummary(filters),
    placeholderData: (prev) => prev,
  });
}

export function useDashboardTrendsQuery(filters: TransactionFilters) {
  return useQuery({
    queryKey: ['dashboard', 'trends', filters],
    queryFn: () => fetchDashboardTrends(filters),
    placeholderData: (prev) => prev,
  });
}

export function useCategoryBreakdownQuery(filters: TransactionFilters) {
  return useQuery({
    queryKey: ['dashboard', 'categories', filters],
    queryFn: () => fetchCategoryBreakdown(filters),
    placeholderData: (prev) => prev,
  });
}

export function useStatusBreakdownQuery(filters: TransactionFilters) {
  return useQuery({
    queryKey: ['dashboard', 'status', filters],
    queryFn: () => fetchStatusBreakdown(filters),
    placeholderData: (prev) => prev,
  });
}
