import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatMonthLabel, formatBytes, formatCompactNumber } from '@/utils/format';

describe('format utilities', () => {
  it('formats currency as INR with two decimals', () => {
    expect(formatCurrency(1500)).toContain('1,500.00');
  });

  it('formats a compact number using Indian numbering (lakh/crore)', () => {
    // en-IN compact notation renders 1,500,000 as "15L" (15 lakh), not "1.5M".
    expect(formatCompactNumber(1500000)).toMatch(/15\s*L/i);
    expect(formatCompactNumber(1500)).toMatch(/1\.5\s*K/i);
  });

  it('formats an ISO date to a readable short date', () => {
    const formatted = formatDate('2024-03-15T00:00:00Z');
    expect(formatted).toContain('2024');
  });

  it('formats a YYYY-MM period into a short month label', () => {
    const label = formatMonthLabel('2024-03');
    expect(label).toMatch(/Mar/i);
  });

  it('formats byte counts into human-readable units', () => {
    expect(formatBytes(500)).toBe('500 B');
    expect(formatBytes(2048)).toBe('2.0 KB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
  });
});
