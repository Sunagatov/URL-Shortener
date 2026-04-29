import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MainLayout } from '@/app/layout/MainLayout';
import SignInPage from '@/features/auth/routes/SignInPage';
import SignUpPage from '@/features/auth/routes/SignUpPage';

vi.mock('@/shared/auth/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
    user: null,
    loading: false,
  }),
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

describe('placeholder flows', () => {
  it('shows a sign up header CTA on the sign in route', () => {
    render(
      <MemoryRouter initialEntries={['/signin']}>
        <MainLayout>
          <div>Page content</div>
        </MainLayout>
      </MemoryRouter>
    );

    const header = screen.getByRole('banner');
    expect(within(header).getByRole('link', { name: 'Sign Up' })).toHaveAttribute('href', '/signup');
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
    expect(within(header).getByRole('link', { name: 'Sign In' })).toHaveAttribute('href', '/signin');
    expect(within(header).queryByRole('link', { name: 'Sign Up' })).not.toBeInTheDocument();
  });

  it('disables forgot password instead of linking to a placeholder route', () => {
    render(
      <MemoryRouter>
        <SignInPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /forgot password/i })).toBeDisabled();
    expect(screen.queryByRole('link', { name: /forgot password/i })).not.toBeInTheDocument();
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

  it('renders footer policy and support controls as non-clickable text', () => {
    render(
      <MemoryRouter>
        <MainLayout>
          <div>Page content</div>
        </MainLayout>
      </MemoryRouter>
    );

    expect(screen.getByText(/privacy policy \(coming soon\)/i)).toBeInTheDocument();
    expect(screen.getByText(/terms of service \(coming soon\)/i)).toBeInTheDocument();
    expect(screen.getByText(/support \(coming soon\)/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /privacy policy/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /terms of service/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /support/i })).not.toBeInTheDocument();
  });
});
