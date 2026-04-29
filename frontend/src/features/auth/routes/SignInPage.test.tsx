import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as authApi from '@/features/auth/api/authApi';
import SignInPage from '@/features/auth/routes/SignInPage';

const login = vi.fn();

vi.mock('@/features/auth/api/authApi', () => ({
  signIn: vi.fn(),
  getUserProfile: vi.fn(),
}));

vi.mock('@/shared/auth/useAuth', () => ({
  useAuth: () => ({
    login,
    updateUser: vi.fn(),
    isAuthenticated: false,
    user: null,
    logout: vi.fn(),
    loading: false,
  }),
}));

vi.mock('@/shared/api/useApi', () => ({
  useApi: () => ({
    execute: (apiCall: () => Promise<unknown>) => apiCall(),
    loading: false,
    error: null,
    data: null,
    reset: vi.fn(),
  }),
}));

const mockSignIn = vi.mocked(authApi.signIn);
const mockGetUserProfile = vi.mocked(authApi.getUserProfile);

const renderSignInWithRoutes = (state?: unknown) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/signin', state }]}>
      <Routes>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/" element={<div>Home Destination</div>} />
        <Route path="/account/profile" element={<div>Profile Destination</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('SignIn', () => {
  beforeEach(() => {
    mockSignIn.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    mockGetUserProfile.mockResolvedValue({
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      country: 'USA',
      age: 30,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns to the protected route after successful sign-in', async () => {
    const user = userEvent.setup();
    renderSignInWithRoutes({
      from: {
        pathname: '/account/profile',
        search: '?tab=details',
        hash: '#top',
      },
    });

    await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'TestPassword123!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Profile Destination')).toBeInTheDocument();
    expect(login).toHaveBeenCalledWith({ accessToken: 'access-token', refreshToken: 'refresh-token' }, null);
    await waitFor(() =>
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'TestPassword123!',
      })
    );
    await waitFor(() => expect(mockGetUserProfile).toHaveBeenCalled());
  });

  it('falls back to home after successful sign-in without a preserved route', async () => {
    const user = userEvent.setup();
    renderSignInWithRoutes();

    await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'TestPassword123!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Home Destination')).toBeInTheDocument();
  });
});
