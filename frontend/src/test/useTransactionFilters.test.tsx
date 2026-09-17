import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useTransactionFilters } from '@/hooks/useTransactionFilters';
import { ReactNode } from 'react';

function wrapper({ children }: { children: ReactNode }) {
  return <MemoryRouter initialEntries={['/transactions']}>{children}</MemoryRouter>;
}

describe('useTransactionFilters', () => {
  it('defaults to page 1, limit 20, sorted by date desc', () => {
    const { result } = renderHook(() => useTransactionFilters(), { wrapper });
    expect(result.current.query).toMatchObject({ page: 1, limit: 20, sortBy: 'date', sortOrder: 'desc' });
  });

  it('applies a filter patch and resets to page 1 by default', () => {
    const { result } = renderHook(() => useTransactionFilters(), { wrapper });

    act(() => result.current.setQuery({ page: 3 }, false));
    expect(result.current.query.page).toBe(3);

    act(() => result.current.setQuery({ category: 'Revenue' }));
    expect(result.current.query.category).toBe('Revenue');
    expect(result.current.query.page).toBe(1); // reset because resetPage defaults to true
  });

  it('tracks the active filter count', () => {
    const { result } = renderHook(() => useTransactionFilters(), { wrapper });
    expect(result.current.activeFilterCount).toBe(0);

    act(() => result.current.setQuery({ category: 'Revenue', status: 'Paid' }));
    expect(result.current.activeFilterCount).toBe(2);
  });

  it('clearFilters resets filters but preserves sort/limit', () => {
    const { result } = renderHook(() => useTransactionFilters(), { wrapper });

    act(() => result.current.setQuery({ category: 'Revenue', limit: 50, sortBy: 'amount' }, false));
    act(() => result.current.clearFilters());

    expect(result.current.query.category).toBeUndefined();
    expect(result.current.query.limit).toBe(50);
    expect(result.current.query.sortBy).toBe('amount');
  });
});
