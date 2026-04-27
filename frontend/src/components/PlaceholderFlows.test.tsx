import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import SignIn from './SignIn';
import SignUp from './SignUp';

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
    user: null,
    loading: false,
  }),
}));

vi.mock('../hooks/useApi', () => ({
  useApi: () => ({
    execute: vi.fn(),
    loading: false,
    error: null,
  }),
}));

vi.mock('../services/ApiService', () => ({
  ApiService: {
    signIn: vi.fn(),
    signUp: vi.fn(),
  },
}));

describe('placeholder flows', () => {
  it('disables forgot password instead of linking to a placeholder route', () => {
    render(
      <MemoryRouter>
        <SignIn />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /forgot password/i })).toBeDisabled();
    expect(screen.queryByRole('link', { name: /forgot password/i })).not.toBeInTheDocument();
  });

  it('renders terms and privacy as non-clickable coming-soon text', () => {
    render(
      <MemoryRouter>
        <SignUp />
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
