import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { MainLayout } from './MainLayout';
import { endpoints } from '@/shared/api/endpoints';
import httpClient from '@/shared/api/httpClient';
import { AuthProvider } from '@/shared/auth/AuthProvider';
import { storage } from '@/shared/auth/storage';
import { ToastProvider } from '@/shared/ui';

vi.mock('@/shared/api/httpClient', () => ({ default: { post: vi.fn() } }));

const Location = () => <output aria-label="Current route">{useLocation().pathname}</output>;

function renderSignedIn() {
  storage.setTokens({ accessToken: 'access-fixture', refreshToken: 'refresh-fixture' }, true);
  storage.setUser({ email: 'test@example.com' });
  render(
    <MemoryRouter initialEntries={['/account/dashboard']}>
      <ToastProvider>
        <AuthProvider>
          <MainLayout>
            <Location />
          </MainLayout>
        </AuthProvider>
      </ToastProvider>
    </MemoryRouter>
  );
  return userEvent.setup();
}

describe('account menu sign-out', () => {
  afterEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('returns home and renders the signed-out header after the logout response', async () => {
    let acknowledge!: () => void;
    vi.mocked(httpClient.post).mockImplementation(
      () =>
        new Promise(resolve => {
          acknowledge = () => resolve({ status: 204, data: null });
        })
    );
    const user = renderSignedIn();
    await user.click(screen.getByRole('button', { name: 'Open account menu' }));
    await user.click(screen.getByRole('button', { name: 'Sign Out All Devices' }));

    expect(httpClient.post).toHaveBeenCalledWith(endpoints.auth.logout, {
      accessToken: 'access-fixture',
      refreshToken: 'refresh-fixture',
    });
    expect(screen.getByLabelText('Current route')).toHaveTextContent('/account/dashboard');
    expect(storage.hasValidTokens()).toBe(true);

    await act(async () => acknowledge());

    expect(screen.getByLabelText('Current route')).toHaveTextContent(/^\/$/);
    expect(within(screen.getByRole('banner')).getByRole('link', { name: 'Sign In' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Open account menu' })).not.toBeInTheDocument();
    expect(storage.hasValidTokens()).toBe(false);
  });

  it('keeps the account view and lets the user retry when the edge rejects logout', async () => {
    vi.mocked(httpClient.post).mockRejectedValue({ response: { status: 403 } });
    const user = renderSignedIn();
    await user.click(screen.getByRole('button', { name: 'Open account menu' }));
    await user.click(screen.getByRole('button', { name: 'Sign Out All Devices' }));

    expect(await screen.findByText(/could not sign out on the server/i)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Sign Out All Devices' })).toBeEnabled();
    expect(screen.getByLabelText('Current route')).toHaveTextContent('/account/dashboard');
    expect(storage.hasValidTokens()).toBe(true);
  });
});
