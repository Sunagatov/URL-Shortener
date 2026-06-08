import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MainLayout } from '@/app/layout/MainLayout';
import { useAuth } from '@/shared/auth/useAuth';
import SignInPage from '@/features/auth/routes/SignInPage';
import SignUpPage from '@/features/auth/routes/SignUpPage';

vi.mock('@/shared/auth/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/shared/api/useApi', () => ({
  useApi: () => ({
    execute: vi.fn(),
    loading: false,
    error: null,
  }),
}));

vi.mock('@/features/auth/api/authApi', () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);

describe('placeholder flows', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      user: null,
    });
  });

  it('shows a sign up header CTA on the sign in route', () => {
    render(
      <MemoryRouter initialEntries={['/signin']}>
        <MainLayout>
          <div>Page content</div>
        </MainLayout>
      </MemoryRouter>
    );

    const header = screen.getByRole('banner');
    expect(within(header).getByRole('link', { name: 'Sign Up' })).toHaveAttribute(
      'href',
      '/signup'
    );
    expect(within(header).queryByRole('link', { name: 'Sign In' })).not.toBeInTheDocument();
  });

  it('shows a sign in header CTA on the sign up route', () => {
    render(
      <MemoryRouter initialEntries={['/signup']}>
        <MainLayout>
          <div>Page content</div>
        </MainLayout>
      </MemoryRouter>
    );

    const header = screen.getByRole('banner');
    expect(within(header).getByRole('link', { name: 'Sign In' })).toHaveAttribute(
      'href',
      '/signin'
    );
    expect(within(header).queryByRole('link', { name: 'Sign Up' })).not.toBeInTheDocument();
  });

  it('links forgot password to the recovery flow', () => {
    render(
      <MemoryRouter>
        <SignInPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /forgot password/i })).toHaveAttribute(
      'href',
      '/forgot-password'
    );
  });

  it('renders terms and privacy as non-clickable coming-soon text', () => {
    render(
      <MemoryRouter>
        <SignUpPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/terms of service \(coming soon\)/i)).toBeInTheDocument();
    expect(screen.getByText(/privacy policy \(coming soon\)/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /terms of service/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /privacy policy/i })).not.toBeInTheDocument();
  });

  it('renders footer policy text and report abuse link', () => {
    render(
      <MemoryRouter>
        <MainLayout>
          <div>Page content</div>
        </MainLayout>
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /report abuse/i })).toHaveAttribute('href', '/abuse');
    expect(screen.getByText(/privacy policy/i)).toBeInTheDocument();
    expect(screen.getByText(/terms of service/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /privacy policy/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /terms of service/i })).not.toBeInTheDocument();
  });

  it('renders a mobile bottom tab bar for authenticated users', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      updateUser: vi.fn(),
      user: { email: 'test@example.com' },
    });

    render(
      <MemoryRouter initialEntries={['/account/dashboard']}>
        <MainLayout>
          <div>Page content</div>
        </MainLayout>
      </MemoryRouter>
    );

    const mobileNavigation = screen.getByRole('navigation', { name: 'Mobile navigation' });
    expect(mobileNavigation).toBeInTheDocument();
    expect(within(mobileNavigation).getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/'
    );
    expect(within(mobileNavigation).getByRole('link', { name: 'My URLs' })).toHaveAttribute(
      'href',
      '/account/url-mappings'
    );
    expect(within(mobileNavigation).getByRole('link', { name: 'Account' })).toHaveAttribute(
      'href',
      '/account'
    );
  });
});
