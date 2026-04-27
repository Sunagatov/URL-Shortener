import { render, screen } from '@testing-library/react';
import type { AuthContextType } from './types';
import App from './App';
import { useAuth } from './hooks/useAuth';

vi.mock('./hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('./layouts/MainLayout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

vi.mock('./components/UrlShortener', () => ({ default: () => <div>Home Page</div> }));
vi.mock('./components/SignIn', () => ({ default: () => <div>Sign In Page</div> }));
vi.mock('./components/SignUp', () => ({ default: () => <div>Sign Up Page</div> }));
vi.mock('./components/UserAccount', () => ({ default: () => <div>Profile Page</div> }));
vi.mock('./components/UserUrlMappings', () => ({ default: () => <div>URL Mappings Page</div> }));
vi.mock('./components/UrlMappingDetails', () => ({ default: () => <div>URL Mapping Details Page</div> }));
vi.mock('./components/Security', () => ({ default: () => <div>Security Page</div> }));
vi.mock('./components/Dashboard', () => ({ default: () => <div>Dashboard Page</div> }));

const mockUseAuth = vi.mocked(useAuth);

const authValue = (overrides: Partial<AuthContextType>): AuthContextType => ({
  isAuthenticated: false,
  user: null,
  login: vi.fn(),
  logout: vi.fn(),
  loading: false,
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
