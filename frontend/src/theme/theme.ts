import { createTheme } from '@mui/material/styles';

export const colors = {
  ink: '#14171F',
  inkMuted: '#262A36',
  paper: '#F7F7F4',
  card: '#FFFFFF',
  border: '#E3E1DB',
  text: '#1B1E27',
  textMuted: '#6B6F7A',
  revenue: '#2F6F5E',
  revenueSoft: '#E4EFEC',
  expense: '#B24C3B',
  expenseSoft: '#F6E7E4',
  pending: '#C08A2E',
  pendingSoft: '#F5EBD8',
};

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: colors.revenue, contrastText: '#FFFFFF' },
    error: { main: colors.expense },
    warning: { main: colors.pending },
    background: { default: colors.paper, paper: colors.card },
    text: { primary: colors.text, secondary: colors.textMuted },
    divider: colors.border,
  },
  typography: {
    fontFamily: '"IBM Plex Sans", "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 600 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600, letterSpacing: '-0.01em' },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, boxShadow: 'none' },
        contained: { boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${colors.border}`,
          boxShadow: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 600, color: colors.textMuted, fontSize: '0.75rem', textTransform: 'none' },
      },
    },
  },
});

export const monoFont = '"IBM Plex Mono", "SFMono-Regular", Consolas, monospace';
