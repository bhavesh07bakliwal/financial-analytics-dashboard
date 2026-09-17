import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import { ReactNode } from 'react';
import { monoFont } from '@/theme/theme';

interface KpiCardProps {
  label: string;
  value: string;
  helperText?: string;
  accentColor: string;
  icon: ReactNode;
  isLoading?: boolean;
}

export function KpiCard({ label, value, helperText, accentColor, icon, isLoading }: KpiCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            {label}
          </Typography>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${accentColor}1A`,
              color: accentColor,
            }}
          >
            {icon}
          </Box>
        </Box>
        {isLoading ? (
          <Skeleton width="70%" height={36} />
        ) : (
          <Typography variant="h5" sx={{ fontFamily: monoFont, fontWeight: 600 }}>
            {value}
          </Typography>
        )}
        {helperText && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {helperText}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
