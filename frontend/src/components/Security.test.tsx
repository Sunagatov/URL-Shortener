import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ApiService } from '../services/ApiService';
import Security from './Security';

const logout = vi.fn();

vi.mock('../services/ApiService', () => ({
  ApiService: {
    changePassword: vi.fn(),
  },
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    logout,
    login: vi.fn(),
    updateUser: vi.fn(),
    isAuthenticated: true,
    user: null,
    loading: false,
  }),
}));

vi.mock('./SidePanel', () => ({
  default: () => <aside>Side Panel</aside>,
}));

const renderSecurity = () =>
  render(
    <MemoryRouter initialEntries={['/account/security']}>
      <Routes>
        <Route path="/account/security" element={<Security />} />
        <Route path="/signin" element={<div>Sign In Destination</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('Security', () => {
  beforeEach(() => {
    vi.mocked(ApiService.changePassword).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders security feature badges with static Tailwind classes', () => {
    renderSecurity();

    const activeBadges = screen.getAllByText('Active');
    expect(activeBadges).toHaveLength(3);
    expect(activeBadges[0]).toHaveClass('bg-green-100', 'text-green-600');
  });

  it('does not show fabricated account security facts', () => {
    renderSecurity();

    expect(screen.getByText('Security summary is not available yet')).toBeInTheDocument();
    expect(screen.getByText('Last password change information is not available yet')).toBeInTheDocument();
    expect(screen.queryByText('All systems secure')).not.toBeInTheDocument();
    expect(screen.queryByText('30 days ago')).not.toBeInTheDocument();
  });

  it('renders weak, medium, and strong password strength using explicit classes', async () => {
    const user = userEvent.setup();
    renderSecurity();

    const newPasswordInput = screen.getByPlaceholderText('Enter your new password');

    await user.type(newPasswordInput, 'a');
    expect(screen.getByText('Weak')).toHaveClass('text-red-600');

    await user.clear(newPasswordInput);
    await user.type(newPasswordInput, 'abcdefgH');
    expect(screen.getByText('Medium')).toHaveClass('text-yellow-600');

    await user.clear(newPasswordInput);
    await user.type(newPasswordInput, 'Abcdefg1!');
    expect(screen.getByText('Strong')).toHaveClass('text-green-600');
  });

  it('submits password changes through the central API service', async () => {
    const user = userEvent.setup();
    renderSecurity();

    await user.type(screen.getByPlaceholderText('Enter your current password'), 'OldPassword1!');
    await user.type(screen.getByPlaceholderText('Enter your new password'), 'NewPassword1!');
    await user.type(screen.getByPlaceholderText('Confirm your new password'), 'NewPassword1!');
    await user.click(screen.getByRole('button', { name: /update password/i }));

    expect(ApiService.changePassword).toHaveBeenCalledWith({
      currentPassword: 'OldPassword1!',
      newPassword: 'NewPassword1!',
    });
  });

  it('logs out and redirects to sign-in when the session is no longer valid', async () => {
    const user = userEvent.setup();
    vi.mocked(ApiService.changePassword).mockRejectedValue({
      response: {
        status: 403,
        data: {
          errorMessage: 'Access denied',
        },
      },
    });

    renderSecurity();

    await user.type(screen.getByPlaceholderText('Enter your current password'), 'OldPassword1!');
    await user.type(screen.getByPlaceholderText('Enter your new password'), 'NewPassword1!');
    await user.type(screen.getByPlaceholderText('Confirm your new password'), 'NewPassword1!');
    await user.click(screen.getByRole('button', { name: /update password/i }));

    expect(await screen.findByText('Sign In Destination')).toBeInTheDocument();
    await waitFor(() => expect(logout).toHaveBeenCalled());
  });
});
