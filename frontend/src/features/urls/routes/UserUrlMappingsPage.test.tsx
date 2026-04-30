import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { getVisiblePages } from '@/features/urls/lib/urlMappings';
import * as urlsApi from '@/features/urls/api/urlsApi';
import UserUrlMappingsPage from '@/features/urls/routes/UserUrlMappingsPage';

vi.mock('@/features/urls/api/urlsApi', () => ({
  getUserUrls: vi.fn(),
  deleteUrl: vi.fn(),
}));

vi.mock('@/app/layout/AccountSidebar', () => ({
  default: () => <aside>Side Panel</aside>,
}));

const mockGetUserUrls = vi.mocked(urlsApi.getUserUrls);
const mockDeleteUrl = vi.mocked(urlsApi.deleteUrl);

const mapping = {
  urlHash: 'abc123',
  shortUrl: 'https://sho.rt/abc123',
  originalUrl: 'https://example.com/a-long-url',
  clickCount: 0,
  createdAt: '2024-01-01T00:00:00.000Z',
  expirationDate: '2024-02-01T00:00:00.000Z',
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
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders expiration dates from expirationDate', async () => {
    mockGetUserUrls.mockResolvedValue({
      content: [mapping],
      page: 0,
      size: 6,
      totalElements: 1,
      totalPages: 1,
    });

    render(
      <MemoryRouter>
        <UserUrlMappingsPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Feb 1, 2024/i)).toBeInTheDocument();
  });

  it('shows click counts and an inline open-short-url action in the card header', async () => {
    mockGetUserUrls.mockResolvedValue({
      content: [{ ...mapping, clickCount: 12 }],
      page: 0,
      size: 6,
      totalElements: 1,
      totalPages: 1,
    });

    render(
      <MemoryRouter>
        <UserUrlMappingsPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('12 clicks')).toBeInTheDocument();
    expect(screen.getByLabelText('Open short URL https://sho.rt/abc123')).toHaveAttribute(
      'href',
      'https://sho.rt/abc123'
    );
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
        <UserUrlMappingsPage />
      </MemoryRouter>
    );

    await userEvent.click(await screen.findByRole('button', { name: '2' }));
    await waitFor(() => expect(mockGetUserUrls).toHaveBeenCalledWith(1, 6));

    await userEvent.click(screen.getByTitle('Delete URL'));
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(mockDeleteUrl).toHaveBeenCalledWith('abc123'));
    await waitFor(() => expect(mockGetUserUrls).toHaveBeenCalledWith(0, 6));
  });

  it('shows the backend access-denied message when deletion is forbidden', async () => {
    mockGetUserUrls.mockResolvedValue({
      content: [mapping],
      page: 0,
      size: 6,
      totalElements: 1,
      totalPages: 1,
    });
    mockDeleteUrl.mockRejectedValue({
      response: {
        status: 403,
        data: {
          errorMessage: 'You are not allowed to delete this URL mapping',
        },
      },
    });

    render(
      <MemoryRouter>
        <UserUrlMappingsPage />
      </MemoryRouter>
    );

    await userEvent.click(await screen.findByTitle('Delete URL'));
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    expect(
      await screen.findByText('You are not allowed to delete this URL mapping')
    ).toBeInTheDocument();
  });

  it('opens a confirm modal before deleting a URL from the list', async () => {
    mockGetUserUrls.mockResolvedValue({
      content: [mapping],
      page: 0,
      size: 6,
      totalElements: 1,
      totalPages: 1,
    });

    render(
      <MemoryRouter>
        <UserUrlMappingsPage />
      </MemoryRouter>
    );

    await userEvent.click(await screen.findByTitle('Delete URL'));

    expect(screen.getByText('Delete URL?')).toBeInTheDocument();
    expect(mockDeleteUrl).not.toHaveBeenCalled();
  });
});
