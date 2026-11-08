import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import UrlShortenerPage from './UrlShortenerPage';
import { createUrl } from '@/features/urls/api/urlsApi';
import { ToastProvider } from '@/shared/ui/Toast';

const authState = vi.hoisted(() => ({ isAuthenticated: false }));
vi.mock('@/features/urls/api/urlsApi', () => ({ createUrl: vi.fn() }));
vi.mock('@/shared/auth/useAuth', () => ({ useAuth: () => authState }));
vi.mock('@/shared/config/features', () => ({ features: { urlCreateTurnstile: true } }));
vi.mock('@/shared/ui/TurnstileWidget', () => ({
  TurnstileWidget: ({ onVerify }: { onVerify: (token: string) => void }) => (
    <button type="button" onClick={() => onVerify('test-token')}>
      Verify test challenge
    </button>
  ),
}));
vi.mock('@/features/urls/ui/landing/LandingStatsSection', () => ({
  LandingStatsSection: () => null,
}));

describe('homepage verification', () => {
  afterEach(() => {
    vi.clearAllMocks();
    authState.isAuthenticated = false;
  });

  it('starts on URL input, requires verification and clears it for a new link', async () => {
    vi.mocked(createUrl).mockResolvedValue({ shortUrl: 'https://zuf.uk/test-link' });
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ToastProvider>
          <UrlShortenerPage />
        </ToastProvider>
      </MemoryRouter>
    );
    expect(screen.queryByRole('button', { name: 'Verify test challenge' })).toBeNull();

    await user.type(
      screen.getByPlaceholderText('Paste your long URL here…'),
      'https://example.com'
    );
    expect(screen.getByRole('button', { name: 'Verify test challenge' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Shorten' }));
    await screen.findByText('Complete the security check to continue.');
    expect(createUrl).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Verify test challenge' }));
    await user.click(screen.getByRole('button', { name: 'Shorten' }));
    await waitFor(() => expect(createUrl).toHaveBeenCalledOnce());
    expect(createUrl).toHaveBeenCalledWith({
      originalUrl: 'https://example.com',
      turnstileToken: 'test-token',
    });
    await user.click(await screen.findByRole('button', { name: 'Clear' }));
    expect(screen.getByPlaceholderText('Paste your long URL here…')).toHaveValue('');
    expect(screen.queryByRole('button', { name: 'Verify test challenge' })).toBeNull();
  });

  it('requires explicit signed-in opt-in before including an expiry email reminder', async () => {
    authState.isAuthenticated = true;
    vi.mocked(createUrl).mockResolvedValue({ shortUrl: 'https://zuf.uk/test-link' });
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ToastProvider>
          <UrlShortenerPage />
        </ToastProvider>
      </MemoryRouter>
    );
    await user.click(screen.getByRole('button', { name: 'Advanced options' }));
    const reminder = screen.getByRole('checkbox', { name: /email me a reminder/i });
    expect(reminder).not.toBeChecked();
    await user.click(reminder);
    await user.selectOptions(screen.getByRole('combobox', { name: 'Link expiration' }), '1');
    await user.type(
      screen.getByPlaceholderText('Paste your long URL here…'),
      'https://example.com'
    );
    await user.click(screen.getByRole('button', { name: 'Verify test challenge' }));
    await user.click(screen.getByRole('button', { name: 'Shorten' }));
    await waitFor(() =>
      expect(createUrl).toHaveBeenCalledWith({
        originalUrl: 'https://example.com',
        daysCount: 1,
        expirationReminder: true,
        turnstileToken: 'test-token',
      })
    );
  });
});
