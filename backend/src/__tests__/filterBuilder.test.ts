import { buildTransactionFilter } from '../services/filterBuilder';

describe('buildTransactionFilter (pure unit, no DB)', () => {
  it('returns an empty filter when no input is given', () => {
    expect(buildTransactionFilter({})).toEqual({});
  });

  it('combines category, status, and userId filters', () => {
    const filter = buildTransactionFilter({ category: 'Revenue', status: 'Paid', userId: 'user_001' });
    expect(filter).toEqual({ category: 'Revenue', status: 'Paid', user_id: 'user_001' });
  });

  it('builds a date range filter', () => {
    const filter = buildTransactionFilter({ startDate: '2024-01-01', endDate: '2024-06-30' });
    expect(filter.date).toEqual({ $gte: new Date('2024-01-01'), $lte: new Date('2024-06-30') });
  });

  it('builds an amount range filter', () => {
    const filter = buildTransactionFilter({ minAmount: 100, maxAmount: 500 });
    expect(filter.amount).toEqual({ $gte: 100, $lte: 500 });
  });

  it('escapes regex special characters in search input', () => {
    const filter = buildTransactionFilter({ search: 'user_001 (test)' });
    const orClause = filter.$or as { user_id: RegExp }[];
    expect(orClause[0].user_id.source).toContain('\\(test\\)');
  });

  it('adds numeric id/amount matches when search term is numeric', () => {
    const filter = buildTransactionFilter({ search: '1500' });
    const clauses = filter.$or as Record<string, unknown>[];
    expect(clauses.some((c) => c.id === 1500)).toBe(true);
    expect(clauses.some((c) => c.amount === 1500)).toBe(true);
  });
});
