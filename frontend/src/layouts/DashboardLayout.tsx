import { Outlet, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { colors } from '@/theme/theme';

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Revenue, expenses, and cash flow at a glance' },
  '/transactions': { title: 'Transactions', subtitle: 'Search, filter, and export company transactions' },
};

export function DashboardLayout() {
  const location = useLocation();
  const meta = PAGE_META[location.pathname] ?? PAGE_META['/'];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: colors.paper }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <TopBar title={meta.title} subtitle={meta.subtitle} />
        <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
