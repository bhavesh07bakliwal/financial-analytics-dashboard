import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from '@/pages/LoginPage';
import { AlertProvider } from '@/components/AlertProvider';
import { AuthProvider } from '@/hooks/useAuth';
import * as authApi from '@/api/authApi';
import { ApiRequestError } from '@/api/client';

vi.mock('@/api/authApi');

const mockedLogin = vi.mocked(authApi.loginRequest);
const mockedMe = vi.mocked(authApi.fetchCurrentUser);

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AlertProvider>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </AlertProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedMe.mockRejectedValue(new ApiRequestError('Not authenticated', 'AUTH_REQUIRED', 401));
});

describe('LoginPage', () => {
  it('renders demo credentials pre-filled', async () => {
    renderLogin();
    expect(await screen.findByDisplayValue('demo@financeapp.com')).toBeInTheDocument();
  });

  it('calls the login API with submitted credentials', async () => {
    mockedLogin.mockResolvedValue({ id: '1', name: 'Demo Analyst', email: 'demo@financeapp.com' });
    const user = userEvent.setup();
    renderLogin();

    await screen.findByDisplayValue('demo@financeapp.com');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(mockedLogin).toHaveBeenCalledWith('demo@financeapp.com', 'Demo@1234'));
  });

  it('shows an alert chip when login fails', async () => {
    mockedLogin.mockRejectedValue(new ApiRequestError('Invalid email or password', 'INVALID_CREDENTIALS', 401));
    const user = userEvent.setup();
    renderLogin();

    await screen.findByDisplayValue('demo@financeapp.com');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
  });
});
