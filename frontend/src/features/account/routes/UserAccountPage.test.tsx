import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as profileApi from '@/shared/api/profileApi';
import UserAccountPage from '@/features/account/routes/UserAccountPage';

vi.mock('@/shared/api/profileApi', () => ({
  getUserProfile: vi.fn(),
}));

vi.mock('@/shared/auth/useAuth', () => ({
  useAuth: () => ({
    logout: vi.fn(),
    login: vi.fn(),
    updateUser: vi.fn(),
    isAuthenticated: true,
    user: null,
  }),
}));

vi.mock('@/features/account/ui/layout/AccountSidebar', () => ({
  default: () => <aside>Side Panel</aside>,
}));

const mockGetUserProfile = vi.mocked(profileApi.getUserProfile);
const renderUserAccount = () =>
  render(
    <MemoryRouter initialEntries={['/account/profile']}>
      <Routes>
        <Route path="/account/profile" element={<UserAccountPage />} />
        <Route path="/signin" element={<div>Sign In Destination</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('UserAccount', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders profile details from the central API service', async () => {
    mockGetUserProfile.mockResolvedValue({
      id: 'user-1',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      country: 'United States',
      age: 25,
      createdAt: '2024-01-15T12:00:00.000Z',
    });

    renderUserAccount();

    expect(await screen.findByText('Test User')).toBeInTheDocument();
    expect(screen.getAllByText('test@example.com')[0]).toBeInTheDocument();
    expect(screen.getByText('United States')).toBeInTheDocument();
    expect(screen.getByText('25 years old')).toBeInTheDocument();
    expect(screen.getAllByText(/Jan 15, 2024/i)[0]).toBeInTheDocument();
    expect(mockGetUserProfile).toHaveBeenCalledTimes(1);
  });

  it('shows an error when the profile request fails', async () => {
    mockGetUserProfile.mockRejectedValue(new Error('Request failed'));

    renderUserAccount();

    expect(await screen.findByText('Request failed')).toBeInTheDocument();
  });

  it('shows the backend message when profile loading is rejected', async () => {
    mockGetUserProfile.mockRejectedValue({
      response: {
        status: 404,
        data: {
          errorMessage: 'User not found',
        },
      },
    });

    renderUserAccount();

    expect(await screen.findByText('Profile unavailable')).toBeInTheDocument();
    expect(screen.getByText('User not found')).toBeInTheDocument();
  });

  it('renders only the available first name in the profile header', async () => {
    mockGetUserProfile.mockResolvedValue({
      id: 'user-1',
      firstName: 'Test',
      email: 'test@example.com',
      createdAt: '2024-01-15T12:00:00.000Z',
    });

    renderUserAccount();

    expect(await screen.findByRole('heading', { name: 'Test' })).toBeInTheDocument();
    expect(screen.queryByText(/undefined/i)).not.toBeInTheDocument();
  });

  it('falls back to User when profile names are missing', async () => {
    mockGetUserProfile.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      createdAt: '2024-01-15T12:00:00.000Z',
    });

    renderUserAccount();

    expect(await screen.findByRole('heading', { name: 'User' })).toBeInTheDocument();
    expect(screen.queryByText(/undefined/i)).not.toBeInTheDocument();
  });
});
