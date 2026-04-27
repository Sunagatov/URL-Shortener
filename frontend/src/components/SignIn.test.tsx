import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ApiService } from '../services/ApiService';
import SignIn from './SignIn';

const login = vi.fn();

vi.mock('../services/ApiService', () => ({
  ApiService: {
    signIn: vi.fn(),
  },
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    login,
    isAuthenticated: false,
    user: null,
    logout: vi.fn(),
    loading: false,
  }),
}));

vi.mock('../hooks/useApi', () => ({
  useApi: () => ({
    execute: (apiCall: () => Promise<unknown>) => apiCall(),
    loading: false,
    error: null,
    data: null,
    reset: vi.fn(),
  }),
}));

const mockSignIn = vi.mocked(ApiService.signIn);

const renderSignInWithRoutes = (state?: unknown) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/signin', state }]}>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
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
      user: {
        id: 'user-1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
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
      expect.objectContaining({ email: 'test@example.com' })
    );
    await waitFor(() =>
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'TestPassword123!',
      })
    );
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
