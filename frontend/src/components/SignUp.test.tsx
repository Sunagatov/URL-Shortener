import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ApiService } from '../services/ApiService';
import SignIn from './SignIn';
import SignUp from './SignUp';

const login = vi.fn();

vi.mock('../services/ApiService', () => ({
  ApiService: {
    signUp: vi.fn(),
    getUserProfile: vi.fn(),
  },
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    login,
    updateUser: vi.fn(),
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

const mockSignUp = vi.mocked(ApiService.signUp);
const mockGetUserProfile = vi.mocked(ApiService.getUserProfile);

const renderSignUp = () =>
  render(
    <MemoryRouter>
      <SignUp />
    </MemoryRouter>
  );

const renderAuthRoutes = (initialPath: '/signin' | '/signup', state?: unknown) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: initialPath, state }]}>
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={<div>Home Destination</div>} />
        <Route path="/account/profile" element={<div>Profile Destination</div>} />
      </Routes>
    </MemoryRouter>
  );

const fillRequiredFields = async () => {
  await userEvent.type(screen.getByLabelText(/first name/i), 'Test');
  await userEvent.type(screen.getByLabelText(/last name/i), 'User');
  await userEvent.type(screen.getByLabelText(/email address/i), 'test@example.com');
  await userEvent.type(screen.getByLabelText(/^password$/i), 'TestPassword123!');
  await userEvent.click(screen.getByRole('checkbox'));
};

describe('SignUp', () => {
  beforeEach(() => {
    mockSignUp.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
    mockGetUserProfile.mockResolvedValue({
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      country: 'USA',
      age: 25,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('requires country before submission', async () => {
    renderSignUp();

    await fillRequiredFields();
    await userEvent.type(screen.getByLabelText(/age/i), '25');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/country is required/i)).toBeInTheDocument();
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('submits country and numeric age in the signup payload', async () => {
    renderSignUp();

    await fillRequiredFields();
    await userEvent.type(screen.getByLabelText(/country/i), 'United States');
    await userEvent.type(screen.getByLabelText(/age/i), '25');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() =>
      expect(mockSignUp).toHaveBeenCalledWith({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'TestPassword123!',
        country: 'United States',
        age: 25,
      })
    );
  });

  it('returns to the protected route after successful sign-up', async () => {
    renderAuthRoutes('/signup', {
      from: {
        pathname: '/account/profile',
        search: '?tab=details',
        hash: '#top',
      },
    });

    await fillRequiredFields();
    await userEvent.type(screen.getByLabelText(/country/i), 'United States');
    await userEvent.type(screen.getByLabelText(/age/i), '25');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText('Profile Destination')).toBeInTheDocument();
  });

  it('preserves the protected route when switching from sign-in to sign-up', async () => {
    renderAuthRoutes('/signin', {
      from: {
        pathname: '/account/profile',
        search: '?tab=details',
        hash: '#top',
      },
    });

    await userEvent.click(screen.getByRole('link', { name: /sign up for free/i }));
    await fillRequiredFields();
    await userEvent.type(screen.getByLabelText(/country/i), 'United States');
    await userEvent.type(screen.getByLabelText(/age/i), '25');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText('Profile Destination')).toBeInTheDocument();
  });
});
