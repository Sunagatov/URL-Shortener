import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import GoogleCallbackPage from './GoogleCallbackPage';
import { googleAuth } from '@/features/auth/api/authApi';
import { consumeGoogleTransaction } from '@/features/auth/lib/googleOAuth';

const { login, updateUser } = vi.hoisted(() => ({ login: vi.fn(), updateUser: vi.fn() }));
vi.mock('@/shared/auth/useAuth', () => ({ useAuth: () => ({ login, updateUser }) }));
vi.mock('@/features/auth/api/authApi', () => ({ googleAuth: vi.fn() }));
vi.mock('@/features/auth/lib/googleOAuth', () => ({ consumeGoogleTransaction: vi.fn() }));
vi.mock('@/shared/api/profileApi', () => ({
  getUserProfile: vi.fn().mockResolvedValue({ email: 'owner@example.test' }),
}));

function showCallback() {
  return render(
    <MemoryRouter initialEntries={['/auth/google/callback?code=code&state=state']}>
      <Routes>
        <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
        <Route path="/account/dashboard" element={<p>Account destination</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Google callback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not exchange a code or install tokens for an unbound callback', async () => {
    vi.mocked(consumeGoogleTransaction).mockImplementation(() => {
      throw new Error('unbound');
    });
    showCallback();
    expect(await screen.findByText('unbound')).toBeInTheDocument();
    expect(googleAuth).not.toHaveBeenCalled();
    expect(login).not.toHaveBeenCalled();
  });

  it('passes the bound verifier to the API and completes the intended navigation', async () => {
    vi.mocked(consumeGoogleTransaction).mockReturnValue({
      codeVerifier: 'v'.repeat(43),
      destination: '/account/dashboard',
    });
    vi.mocked(googleAuth).mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' });
    showCallback();
    await waitFor(() => expect(googleAuth).toHaveBeenCalledWith('code', 'v'.repeat(43)));
    expect(await screen.findByText('Account destination')).toBeInTheDocument();
    expect(login).toHaveBeenCalledWith(
      { accessToken: 'access', refreshToken: 'refresh' },
      null,
      false
    );
  });
});
