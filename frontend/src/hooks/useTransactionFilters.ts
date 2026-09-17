import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SortField, SortOrder, TransactionCategory, TransactionQuery, TransactionStatus } from '@/types';

const DEFAULTS: TransactionQuery = {
  page: 1,
  limit: 20,
  sortBy: 'date',
  sortOrder: 'desc',
};

export interface QuickFilterPreset {
  label: string;
  patch: Partial<TransactionQuery>;
}

export const QUICK_FILTERS: QuickFilterPreset[] = [
  { label: 'All', patch: { category: undefined, status: undefined, minAmount: undefined } },
  { label: 'Revenue', patch: { category: 'Revenue', status: undefined, minAmount: undefined } },
  { label: 'Expenses', patch: { category: 'Expense', status: undefined, minAmount: undefined } },
  { label: 'Paid', patch: { status: 'Paid', category: undefined, minAmount: undefined } },
  { label: 'Pending', patch: { status: 'Pending', category: undefined, minAmount: undefined } },
  { label: 'High value (>2500)', patch: { minAmount: 2500, category: undefined, status: undefined } },
];

export function useTransactionFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const query: TransactionQuery = useMemo(() => {
    const get = (key: string) => searchParams.get(key) ?? undefined;
    return {
      page: Number(get('page') ?? DEFAULTS.page),
      limit: Number(get('limit') ?? DEFAULTS.limit),
      sortBy: (get('sortBy') as SortField) ?? DEFAULTS.sortBy,
      sortOrder: (get('sortOrder') as SortOrder) ?? DEFAULTS.sortOrder,
      search: get('search'),
      startDate: get('startDate'),
      endDate: get('endDate'),
      minAmount: get('minAmount') ? Number(get('minAmount')) : undefined,
      maxAmount: get('maxAmount') ? Number(get('maxAmount')) : undefined,
      category: get('category') as TransactionCategory | undefined,
      status: get('status') as TransactionStatus | undefined,
      userId: get('userId'),
    };
  }, [searchParams]);

  const setQuery = useCallback(
    (patch: Partial<TransactionQuery>, resetPage = true) => {
      const next: TransactionQuery = { ...query, ...patch, page: resetPage ? 1 : (patch.page ?? query.page) };
      const params = new URLSearchParams();
      Object.entries(next).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.set(key, String(value));
        }
      });
      setSearchParams(params, { replace: true });
    },
    [query, setSearchParams]
  );

  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams({ page: '1', limit: String(query.limit), sortBy: query.sortBy, sortOrder: query.sortOrder }), {
      replace: true,
    });
  }, [query.limit, query.sortBy, query.sortOrder, setSearchParams]);

  const activeFilterCount = useMemo(() => {
    return [query.search, query.startDate, query.endDate, query.minAmount, query.maxAmount, query.category, query.status, query.userId].filter(
      (v) => v !== undefined && v !== ''
    ).length;
  }, [query]);

  return { query, setQuery, clearFilters, activeFilterCount };
}
