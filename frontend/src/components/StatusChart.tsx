import { Card, CardContent, Typography, Box, Skeleton, LinearProgress } from '@mui/material';
import { StatusBreakdown } from '@/types';
import { colors, monoFont } from '@/theme/theme';
import { formatCurrency } from '@/utils/format';

const STATUS_COLORS: Record<string, string> = {
  Paid: colors.revenue,
  Pending: colors.pending,
};

export function StatusChart({ data, isLoading }: { data?: StatusBreakdown[]; isLoading: boolean }) {
  const total = data?.reduce((sum, d) => sum + d.count, 0) ?? 0;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.25 }}>
          Status distribution
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Share of transactions by payment status
        </Typography>

        {isLoading ? (
          <Skeleton variant="rounded" height={120} />
        ) : !data || data.length === 0 ? (
          <Box sx={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No data for the selected filters
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {data.map((entry) => {
              const pct = total > 0 ? Math.round((entry.count / total) * 100) : 0;
              return (
                <Box key={entry.status}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {entry.status}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: monoFont }}>
                      {entry.count} txns · {formatCurrency(entry.total)}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={pct}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: colors.border,
                      '& .MuiLinearProgress-bar': { bgcolor: STATUS_COLORS[entry.status] ?? colors.textMuted, borderRadius: 4 },
                    }}
                  />
                </Box>
              );
            })}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
