import { useState } from 'react';
import { Box, Typography, Avatar, IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { useAuth } from '@/hooks/useAuth';
import { useAlerts } from '@/components/AlertProvider';
import { colors } from '@/theme/theme';

export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { user, logout } = useAuth();
  const { notify } = useAlerts();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleLogout = async () => {
    setAnchorEl(null);
    try {
      await logout();
      notify('You have been logged out', 'success');
    } catch {
      notify('Unable to log out — please try again', 'error');
    }
  };

  const initials = user?.name
    ?.split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, md: 4 },
        py: 2.5,
        borderBottom: `1px solid ${colors.border}`,
        bgcolor: colors.card,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <Box>
        <Typography variant="h5">{title}</Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
            {user?.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} aria-label="Account menu" size="small">
          <Avatar sx={{ bgcolor: colors.revenue, width: 36, height: 36, fontSize: '0.85rem' }}>{initials}</Avatar>
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Log out</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}
