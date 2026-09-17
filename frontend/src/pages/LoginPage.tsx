import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Box, Paper, TextField, Button, Typography, Stack, InputAdornment, IconButton } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { useAuth } from '@/hooks/useAuth';
import { useAlerts } from '@/components/AlertProvider';
import { ApiRequestError } from '@/api/client';
import { colors } from '@/theme/theme';

interface LoginFormValues {
  email: string;
  password: string;
}

export function LoginPage() {
  const { user, login, isLoading } = useAuth();
  const { notify } = useAlerts();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: { email: 'demo@financeapp.com', password: 'Demo@1234' },
  });

  if (!isLoading && user) {
    const from = (location.state as { from?: string })?.from ?? '/';
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitting(true);
    try {
      await login(values.email, values.password);
      navigate('/', { replace: true });
    } catch (err) {
      const message = err instanceof ApiRequestError ? err.message : 'Login failed — please try again';
      notify(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: colors.ink,
        px: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{ width: '100%', maxWidth: 400, p: 4.5, borderRadius: 3, border: 'none' }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
          Ledger
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Sign in to view your financial analytics
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={2.5}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              autoComplete="email"
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              {...register('email', { required: 'Email is required' })}
            />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              autoComplete="current-password"
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((s) => !s)}
                      edge="end"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              {...register('password', { required: 'Password is required' })}
            />
            <Button type="submit" variant="contained" size="large" disabled={submitting} fullWidth>
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </Stack>
        </Box>

        <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: colors.revenueSoft }}>
          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.25 }}>
            Demo credentials
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            demo@financeapp.com / Demo@1234
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
