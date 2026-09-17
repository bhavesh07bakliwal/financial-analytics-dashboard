import { NavLink } from 'react-router-dom';
import { Box, Stack, Typography } from '@mui/material';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { colors } from '@/theme/theme';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: SpaceDashboardOutlinedIcon, end: true },
  { to: '/transactions', label: 'Transactions', icon: ReceiptLongOutlinedIcon, end: false },
];

export function Sidebar() {
  return (
    <Box
      component="nav"
      sx={{
        width: 240,
        flexShrink: 0,
        bgcolor: colors.ink,
        color: '#fff',
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        py: 3,
      }}
    >
      <Box sx={{ px: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
          Ledger
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
          Financial Analytics
        </Typography>
      </Box>
      <Stack spacing={0.5} sx={{ px: 2 }}>
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <Box
            key={to}
            component={NavLink}
            to={to}
            end={end}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2,
              py: 1.25,
              borderRadius: 2,
              textDecoration: 'none',
              color: 'rgba(255,255,255,0.75)',
              fontSize: '0.9rem',
              fontWeight: 500,
              transition: 'background-color 120ms ease, color 120ms ease',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.06)', color: '#fff' },
              '&.active': { backgroundColor: colors.revenue, color: '#fff' },
            }}
          >
            <Icon fontSize="small" />
            {label}
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
