import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as urlsApi from '@/features/urls/api/urlsApi';
import UrlMappingDetailsPage from '@/app/routes/UrlMappingDetailsPage';

vi.mock('@/features/urls/api/urlsApi', () => ({
  getUrlDetails: vi.fn(),
  deleteUrl: vi.fn(),
}));

vi.mock('@/features/account/ui/layout/AccountSidebar', () => ({
  default: () => <aside>Side Panel</aside>,
}));

const mockGetUrlDetails = vi.mocked(urlsApi.getUrlDetails);

describe('UrlMappingDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders expiration dates from expirationDate', async () => {
    mockGetUrlDetails.mockResolvedValue({
      urlHash: 'abc123',
      shortUrl: 'https://sho.rt/abc123',
      originalUrl: 'https://example.com/a-long-url',
      clickCount: 0,
      qrScanCount: 0,
      createdAt: '2024-01-01T00:00:00.000Z',
      expirationDate: '2024-02-01T00:00:00.000Z',
    });

    render(
      <MemoryRouter initialEntries={['/account/url-mappings/abc123']}>
        <Routes>
          <Route path="/account/url-mappings/:urlHash" element={<UrlMappingDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/February 1, 2024/i)).toBeInTheDocument();
  });

  it('shows not found state when the route parameter is missing', async () => {
    render(
      <MemoryRouter initialEntries={['/account/url-mappings']}>
        <Routes>
          <Route path="/account/url-mappings" element={<UrlMappingDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/url not found/i)).toBeInTheDocument();
    expect(screen.getByText(/url mapping id is missing/i)).toBeInTheDocument();
    expect(mockGetUrlDetails).not.toHaveBeenCalled();
  });

  it('preserves backend forbidden messages instead of collapsing them into a generic not found state', async () => {
    mockGetUrlDetails.mockRejectedValue({
      response: {
        status: 403,
        data: {
          errorMessage: 'You are not allowed to access this URL mapping',
        },
      },
    });

    render(
      <MemoryRouter initialEntries={['/account/url-mappings/abc123']}>
        <Routes>
          <Route path="/account/url-mappings/:urlHash" element={<UrlMappingDetailsPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/url not found/i)).toBeInTheDocument();
    expect(screen.getByText('You are not allowed to access this URL mapping')).toBeInTheDocument();
  });
});
