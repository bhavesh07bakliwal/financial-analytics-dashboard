import { Chip } from '@mui/material';
import { TransactionStatus } from '@/types';
import { colors } from '@/theme/theme';

const STYLES: Record<TransactionStatus, { bg: string; color: string }> = {
  Paid: { bg: colors.revenueSoft, color: colors.revenue },
  Pending: { bg: colors.pendingSoft, color: colors.pending },
};

export function StatusChip({ status }: { status: TransactionStatus }) {
  const style = STYLES[status];
  return (
    <Chip
      label={status}
      size="small"
      sx={{ bgcolor: style.bg, color: style.color, fontWeight: 600, height: 24 }}
    />
  );
}

export function CategoryChip({ category }: { category: 'Revenue' | 'Expense' }) {
  const isRevenue = category === 'Revenue';
  return (
    <Chip
      label={category}
      size="small"
      variant="outlined"
      sx={{
        borderColor: isRevenue ? colors.revenue : colors.expense,
        color: isRevenue ? colors.revenue : colors.expense,
        fontWeight: 600,
        height: 24,
      }}
    />
  );
}
