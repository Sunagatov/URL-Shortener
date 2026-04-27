import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ApiService } from '../services/ApiService';
import UserUrlMappings, { getVisiblePages } from './UserUrlMappings';

vi.mock('../services/ApiService', () => ({
  ApiService: {
    getUserUrls: vi.fn(),
    deleteUrl: vi.fn(),
  },
}));

vi.mock('./SidePanel', () => ({
  default: () => <aside>Side Panel</aside>,
}));

const mockGetUserUrls = vi.mocked(ApiService.getUserUrls);
const mockDeleteUrl = vi.mocked(ApiService.deleteUrl);

const mapping = {
  id: 'url-1',
  urlHash: 'abc123',
  shortUrl: 'https://sho.rt/abc123',
  originalUrl: 'https://example.com/a-long-url',
  createdAt: '2024-01-01T00:00:00.000Z',
  expiresAt: '2024-02-01T00:00:00.000Z',
  clickCount: 0,
  isActive: true,
};

describe('getVisiblePages', () => {
  it('returns unique page windows near the start, middle, and end', () => {
    expect(getVisiblePages(0, 10)).toEqual([0, 1, 2, 3, 4]);
    expect(getVisiblePages(5, 10)).toEqual([3, 4, 5, 6, 7]);
    expect(getVisiblePages(9, 10)).toEqual([5, 6, 7, 8, 9]);
  });
});

describe('UserUrlMappings', () => {
  beforeEach(() => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders expiration dates from expiresAt', async () => {
    mockGetUserUrls.mockResolvedValue({
      content: [mapping],
      page: 0,
      size: 6,
      totalElements: 1,
      totalPages: 1,
    });

    render(
      <MemoryRouter>
        <UserUrlMappings />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Feb 1, 2024/i)).toBeInTheDocument();
  });

  it('refetches the previous page after deleting the only item on a non-first page', async () => {
    mockGetUserUrls
      .mockResolvedValueOnce({
        content: [mapping],
        page: 0,
        size: 6,
        totalElements: 7,
        totalPages: 2,
      })
      .mockResolvedValueOnce({
        content: [mapping],
        page: 1,
        size: 6,
        totalElements: 7,
        totalPages: 2,
      })
      .mockResolvedValueOnce({
        content: [mapping],
        page: 0,
        size: 6,
        totalElements: 6,
        totalPages: 1,
      });
    mockDeleteUrl.mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <UserUrlMappings />
      </MemoryRouter>
    );

    await userEvent.click(await screen.findByRole('button', { name: '2' }));
    await waitFor(() => expect(mockGetUserUrls).toHaveBeenCalledWith(1, 6));

    await userEvent.click(screen.getByTitle('Delete URL'));

    await waitFor(() => expect(mockDeleteUrl).toHaveBeenCalledWith('abc123'));
    await waitFor(() => expect(mockGetUserUrls).toHaveBeenCalledWith(0, 6));
  });
});
