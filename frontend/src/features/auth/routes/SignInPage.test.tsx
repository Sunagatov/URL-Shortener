import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as profileApi from '@/shared/api/profileApi';
import * as authApi from '@/features/auth/api/authApi';
import SignInPage from '@/features/auth/routes/SignInPage';

const login = vi.fn();

vi.mock('@/features/auth/api/authApi', () => ({
  signIn: vi.fn(),
}));

vi.mock('@/shared/api/profileApi', () => ({
  getUserProfile: vi.fn(),
}));

vi.mock('@/shared/auth/useAuth', () => ({
  useAuth: () => ({
    login,
    updateUser: vi.fn(),
    isAuthenticated: false,
    user: null,
    logout: vi.fn(),
  }),
}));

vi.mock('@/shared/api/useApi', () => ({
  useApi: () => ({
    execute: async (
      apiCall: () => Promise<unknown>,
      options?: {
        onError?: (error: { code?: string; errorMessage: string; status: number }) => void;
      }
    ) => {
      try {
        return await apiCall();
      } catch (error: unknown) {
        const response = (
          error as {
            response?: { status?: number; data?: { code?: string; errorMessage?: string } };
          }
        ).response;
        options?.onError?.({
          code: response?.data?.code,
          errorMessage: response?.data?.errorMessage ?? 'An error occurred',
          status: response?.status ?? 500,
        });
        return null;
      }
    },
    loading: false,
    error: null,
    data: null,
    reset: vi.fn(),
  }),
}));

const mockSignIn = vi.mocked(authApi.signIn);
const mockGetUserProfile = vi.mocked(profileApi.getUserProfile);

const renderSignInWithRoutes = (state?: unknown) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/signin', state }]}>
      <Routes>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/verify-email" element={<div>Verify Email Destination</div>} />
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
    expect(login).toHaveBeenCalledWith(
      { accessToken: 'access-token', refreshToken: 'refresh-token' },
      null
    );
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

  it('redirects unverified users into the verification flow', async () => {
    const user = userEvent.setup();
    mockSignIn.mockRejectedValue({
      response: {
        status: 403,
        data: {
          code: 'EMAIL_NOT_VERIFIED',
          errorMessage: 'Please verify your email before signing in',
        },
      },
    });

    renderSignInWithRoutes({
      from: {
        pathname: '/account/profile',
      },
    });

    await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'TestPassword123!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Verify Email Destination')).toBeInTheDocument();
  });
});
