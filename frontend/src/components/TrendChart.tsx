import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendPoint } from '@/types';
import { colors, monoFont } from '@/theme/theme';
import { formatCompactNumber, formatCurrency, formatMonthLabel } from '@/utils/format';

export function TrendChart({ data, isLoading }: { data?: TrendPoint[]; isLoading: boolean }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.25 }}>
          Revenue vs. expenses
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Monthly trend for the selected period
        </Typography>

        {isLoading ? (
          <Skeleton variant="rounded" height={280} />
        ) : !data || data.length === 0 ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data} margin={{ left: -12, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.revenue} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={colors.revenue} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.expense} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={colors.expense} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
              <XAxis
                dataKey="period"
                tickFormatter={formatMonthLabel}
                tick={{ fontSize: 12, fill: colors.textMuted, fontFamily: monoFont }}
                axisLine={{ stroke: colors.border }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => formatCompactNumber(v)}
                tick={{ fontSize: 12, fill: colors.textMuted, fontFamily: monoFont }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip
                formatter={(value: number, name: string) => [formatCurrency(value), name === 'revenue' ? 'Revenue' : 'Expenses']}
                labelFormatter={(label) => formatMonthLabel(String(label))}
                contentStyle={{ borderRadius: 8, border: `1px solid ${colors.border}`, fontFamily: monoFont, fontSize: 13 }}
              />
              <Area type="monotone" dataKey="revenue" stroke={colors.revenue} strokeWidth={2} fill="url(#revenueFill)" name="revenue" />
              <Area type="monotone" dataKey="expenses" stroke={colors.expense} strokeWidth={2} fill="url(#expenseFill)" name="expenses" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="body2" color="text.secondary">
        No data for the selected filters
      </Typography>
    </Box>
  );
}
