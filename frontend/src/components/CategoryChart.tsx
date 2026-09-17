import { Card, CardContent, Typography, Box, Skeleton, Stack } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { CategoryBreakdown } from '@/types';
import { colors, monoFont } from '@/theme/theme';
import { formatCurrency } from '@/utils/format';

const CATEGORY_COLORS: Record<string, string> = {
  Revenue: colors.revenue,
  Expense: colors.expense,
};

export function CategoryChart({ data, isLoading }: { data?: CategoryBreakdown[]; isLoading: boolean }) {
  const total = data?.reduce((sum, d) => sum + d.total, 0) ?? 0;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.25 }}>
          Category breakdown
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Revenue vs. expense by amount
        </Typography>

        {isLoading ? (
          <Skeleton variant="rounded" height={220} />
        ) : !data || data.length === 0 ? (
          <Box sx={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No data for the selected filters
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 160, height: 160, flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} dataKey="total" nameKey="category" innerRadius={48} outerRadius={72} paddingAngle={2}>
                    {data.map((entry) => (
                      <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category] ?? colors.textMuted} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: 8, border: `1px solid ${colors.border}`, fontFamily: monoFont, fontSize: 13 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Stack spacing={1.5} sx={{ flexGrow: 1 }}>
              {data.map((entry) => (
                <Box key={entry.category}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: CATEGORY_COLORS[entry.category] }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {entry.category}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontFamily: monoFont, ml: 2 }}>
                    {formatCurrency(entry.total)}{' '}
                    <Typography component="span" variant="caption" color="text.secondary">
                      ({total > 0 ? Math.round((entry.total / total) * 100) : 0}%, {entry.count} txns)
                    </Typography>
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
