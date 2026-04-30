import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as passwordResetApi from '@/features/auth/api/passwordResetApi';
import ResetPasswordPage from '@/features/auth/routes/ResetPasswordPage';

vi.mock('@/features/auth/api/passwordResetApi', () => ({
  resetPassword: vi.fn(),
}));

const renderResetPassword = (initialEntry = '/reset-password?token=test-token') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/signin" element={<div>Sign In Destination</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('ResetPasswordPage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('accepts a passphrase-style password and submits it with the recovery token', async () => {
    const user = userEvent.setup();
    vi.mocked(passwordResetApi.resetPassword).mockResolvedValue(undefined);

    renderResetPassword();

    await user.type(screen.getByLabelText(/^new password$/i), 'correct horse battery staple');
    await user.type(
      screen.getByLabelText(/confirm new password/i),
      'correct horse battery staple'
    );
    await user.click(screen.getByRole('button', { name: /save new password/i }));

    expect(await screen.findByText(/password updated/i)).toBeInTheDocument();
    await waitFor(() =>
      expect(passwordResetApi.resetPassword).toHaveBeenCalledWith({
        token: 'test-token',
        newPassword: 'correct horse battery staple',
      })
    );
  });

  it('blocks passwords that are shorter than the new minimum length', async () => {
    const user = userEvent.setup();
    renderResetPassword();

    await user.type(screen.getByLabelText(/^new password$/i), 'short password');
    await user.type(screen.getByLabelText(/confirm new password/i), 'short password');
    expect(screen.getByRole('button', { name: /save new password/i })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /save new password/i }));

    expect(passwordResetApi.resetPassword).not.toHaveBeenCalled();
  });

  it('shows the invalid-link state when no token is present', () => {
    renderResetPassword('/reset-password');

    expect(screen.getByText(/recovery link unavailable/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /request a new reset link/i })).toBeInTheDocument();
  });
});
