import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { theme } from '@/theme/theme';
import { AlertProvider } from '@/components/AlertProvider';
import { AuthProvider } from '@/hooks/useAuth';
import { AppRouter } from '@/router/AppRouter';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <AlertProvider>
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
        </AlertProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
