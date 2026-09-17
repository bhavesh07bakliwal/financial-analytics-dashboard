import { useState } from 'react';
import { Grid, Chip, Stack, Typography, Box } from '@mui/material';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import { KpiCard } from '@/components/KpiCard';
import { TrendChart } from '@/components/TrendChart';
import { CategoryChart } from '@/components/CategoryChart';
import { StatusChart } from '@/components/StatusChart';
import {
  useDashboardSummaryQuery,
  useDashboardTrendsQuery,
  useCategoryBreakdownQuery,
  useStatusBreakdownQuery,
} from '@/hooks/useDataQueries';
import { colors } from '@/theme/theme';
import { formatCurrency } from '@/utils/format';
import { TransactionCategory, TransactionStatus } from '@/types';

type DashboardFilter = { category?: TransactionCategory; status?: TransactionStatus };

const FILTER_CHIPS: { label: string; value: DashboardFilter }[] = [
  { label: 'All transactions', value: {} },
  { label: 'Revenue only', value: { category: 'Revenue' } },
  { label: 'Expenses only', value: { category: 'Expense' } },
  { label: 'Paid only', value: { status: 'Paid' } },
  { label: 'Pending only', value: { status: 'Pending' } },
];

export function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState<DashboardFilter>({});

  // Dashboard filter synchronization: one filter selection drives KPIs + all charts together.
  const summaryQuery = useDashboardSummaryQuery(activeFilter);
  const trendsQuery = useDashboardTrendsQuery(activeFilter);
  const categoryQuery = useCategoryBreakdownQuery(activeFilter);
  const statusQuery = useStatusBreakdownQuery(activeFilter);

  const summary = summaryQuery.data;

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
        {FILTER_CHIPS.map((chip) => {
          const isActive = JSON.stringify(chip.value) === JSON.stringify(activeFilter);
          return (
            <Chip
              key={chip.label}
              label={chip.label}
              onClick={() => setActiveFilter(chip.value)}
              sx={{
                bgcolor: isActive ? colors.ink : 'transparent',
                color: isActive ? '#fff' : colors.text,
                border: `1px solid ${isActive ? colors.ink : colors.border}`,
                fontWeight: 500,
                '&:hover': { bgcolor: isActive ? colors.ink : colors.revenueSoft },
              }}
            />
          );
        })}
      </Stack>

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            label="Total Revenue"
            value={formatCurrency(summary?.totalRevenue ?? 0)}
            helperText={summary ? `${summary.totalCount} transactions` : undefined}
            accentColor={colors.revenue}
            icon={<TrendingUpOutlinedIcon fontSize="small" />}
            isLoading={summaryQuery.isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            label="Total Expenses"
            value={formatCurrency(summary?.totalExpenses ?? 0)}
            helperText="Across selected period"
            accentColor={colors.expense}
            icon={<TrendingDownOutlinedIcon fontSize="small" />}
            isLoading={summaryQuery.isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            label="Net Cash Flow"
            value={formatCurrency(summary?.netCashFlow ?? 0)}
            helperText={summary && summary.netCashFlow >= 0 ? 'Positive' : 'Negative'}
            accentColor={colors.ink}
            icon={<AccountBalanceWalletOutlinedIcon fontSize="small" />}
            isLoading={summaryQuery.isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard
            label="Pending"
            value={String(summary?.pendingCount ?? 0)}
            helperText={summary ? `${summary.paidCount} paid` : undefined}
            accentColor={colors.pending}
            icon={<PendingActionsOutlinedIcon fontSize="small" />}
            isLoading={summaryQuery.isLoading}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={7}>
          <TrendChart data={trendsQuery.data} isLoading={trendsQuery.isLoading} />
        </Grid>
        <Grid item xs={12} lg={5}>
          <CategoryChart data={categoryQuery.data} isLoading={categoryQuery.isLoading} />
        </Grid>
        <Grid item xs={12}>
          <StatusChart data={statusQuery.data} isLoading={statusQuery.isLoading} />
        </Grid>
      </Grid>

      {summaryQuery.isError && (
        <Typography variant="body2" color="error" sx={{ mt: 2 }}>
          Unable to load dashboard metrics. Please refresh the page.
        </Typography>
      )}
    </Box>
  );
}
