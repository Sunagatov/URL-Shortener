import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiService } from '../services/ApiService';
import Security from './Security';

vi.mock('../services/ApiService', () => ({
  ApiService: {
    changePassword: vi.fn(),
  },
}));

vi.mock('./SidePanel', () => ({
  default: () => <aside>Side Panel</aside>,
}));

describe('Security', () => {
  beforeEach(() => {
    vi.mocked(ApiService.changePassword).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders security feature badges with static Tailwind classes', () => {
    render(<Security />);

    const activeBadges = screen.getAllByText('Active');
    expect(activeBadges).toHaveLength(3);
    expect(activeBadges[0]).toHaveClass('bg-green-100', 'text-green-600');
  });

  it('does not show fabricated account security facts', () => {
    render(<Security />);

    expect(screen.getByText('Security summary is not available yet')).toBeInTheDocument();
    expect(screen.getByText('Last password change information is not available yet')).toBeInTheDocument();
    expect(screen.queryByText('All systems secure')).not.toBeInTheDocument();
    expect(screen.queryByText('30 days ago')).not.toBeInTheDocument();
  });

  it('renders weak, medium, and strong password strength using explicit classes', async () => {
    const user = userEvent.setup();
    render(<Security />);

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
    render(<Security />);

    await user.type(screen.getByPlaceholderText('Enter your current password'), 'OldPassword1!');
    await user.type(screen.getByPlaceholderText('Enter your new password'), 'NewPassword1!');
    await user.type(screen.getByPlaceholderText('Confirm your new password'), 'NewPassword1!');
    await user.click(screen.getByRole('button', { name: /update password/i }));

    expect(ApiService.changePassword).toHaveBeenCalledWith({
      currentPassword: 'OldPassword1!',
      newPassword: 'NewPassword1!',
    });
  });
});
