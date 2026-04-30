import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import * as passwordResetApi from '@/features/auth/api/passwordResetApi';
import ForgotPasswordPage from '@/features/auth/routes/ForgotPasswordPage';

vi.mock('@/features/auth/api/passwordResetApi', () => ({
  requestPasswordReset: vi.fn(),
}));

const renderForgotPassword = () =>
  render(
    <MemoryRouter>
      <ForgotPasswordPage />
    </MemoryRouter>
  );

describe('ForgotPasswordPage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows a neutral confirmation after a successful recovery request', async () => {
    const user = userEvent.setup();
    vi.mocked(passwordResetApi.requestPasswordReset).mockResolvedValue(undefined);

    renderForgotPassword();

    await user.type(screen.getByLabelText(/email address/i), 'user@example.com');
    await user.click(screen.getByRole('button', { name: /email recovery link/i }));

    expect(await screen.findByText(/if an account exists for/i)).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
    await waitFor(() =>
      expect(passwordResetApi.requestPasswordReset).toHaveBeenCalledWith('user@example.com')
    );
  });

  it('keeps the confirmation neutral when the API returns an account-specific HTTP error', async () => {
    const user = userEvent.setup();
    vi.mocked(passwordResetApi.requestPasswordReset).mockRejectedValue({
      response: {
        status: 404,
        data: { errorMessage: 'No account found' },
      },
    });

    renderForgotPassword();

    await user.type(screen.getByLabelText(/email address/i), 'missing@example.com');
    await user.click(screen.getByRole('button', { name: /email recovery link/i }));

    expect(await screen.findByText(/if an account exists for/i)).toBeInTheDocument();
    expect(screen.queryByText(/no account found/i)).not.toBeInTheDocument();
  });

  it('shows a connection error when the request never reaches the server', async () => {
    const user = userEvent.setup();
    vi.mocked(passwordResetApi.requestPasswordReset).mockRejectedValue(new Error('Network Error'));

    renderForgotPassword();

    await user.type(screen.getByLabelText(/email address/i), 'user@example.com');
    await user.click(screen.getByRole('button', { name: /email recovery link/i }));

    expect(
      await screen.findByText(/we could not reach the server\. please check your connection/i)
    ).toBeInTheDocument();
  });
});
