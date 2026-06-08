import { render, screen } from '@testing-library/react';
import App from '@/App';
import type { AuthContextType } from '@/shared/auth/types';
import { useAuth } from '@/shared/auth/useAuth';

vi.mock('@/shared/auth/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/app/layout/MainLayout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

vi.mock('@/features/urls/routes/UrlShortenerPage', () => ({ default: () => <div>Home Page</div> }));
vi.mock('@/features/auth/routes/SignInPage', () => ({ default: () => <div>Sign In Page</div> }));
vi.mock('@/features/auth/routes/SignUpPage', () => ({ default: () => <div>Sign Up Page</div> }));
vi.mock('@/features/account/routes/UserAccountPage', () => ({
  default: () => <div>Profile Page</div>,
}));
vi.mock('@/features/urls/routes/UserUrlMappingsPage', () => ({
  default: () => <div>URL Mappings Page</div>,
}));
vi.mock('@/features/urls/routes/UrlMappingDetailsPage', () => ({
  default: () => <div>URL Mapping Details Page</div>,
}));
vi.mock('@/features/account/routes/SecurityPage', () => ({
  default: () => <div>Security Page</div>,
}));
vi.mock('@/features/account/routes/DashboardPage', () => ({
  default: () => <div>Dashboard Page</div>,
}));

const mockUseAuth = vi.mocked(useAuth);

const authValue = (overrides: Partial<AuthContextType>): AuthContextType => ({
  isAuthenticated: false,
  user: null,
  login: vi.fn(),
  updateUser: vi.fn(),
  logout: vi.fn(),
  ...overrides,
});

describe('App routes', () => {
  it('redirects unauthenticated account routes to sign in', async () => {
    mockUseAuth.mockReturnValue(authValue({ isAuthenticated: false }));
    window.history.pushState({}, '', '/account/dashboard');

    render(<App />);

    expect(await screen.findByText('Sign In Page')).toBeInTheDocument();
  });

  it('renders protected account routes for authenticated users', async () => {
    mockUseAuth.mockReturnValue(authValue({ isAuthenticated: true }));
    window.history.pushState({}, '', '/account/dashboard');

    render(<App />);

    expect(await screen.findByText('Dashboard Page')).toBeInTheDocument();
  });

  it('redirects authenticated users away from sign in', async () => {
    mockUseAuth.mockReturnValue(authValue({ isAuthenticated: true }));
    window.history.pushState({}, '', '/signin');

    render(<App />);

    expect(await screen.findByText('Dashboard Page')).toBeInTheDocument();
    expect(screen.queryByText('Sign In Page')).not.toBeInTheDocument();
  });
});
