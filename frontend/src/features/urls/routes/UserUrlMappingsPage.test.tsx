import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { getVisiblePages } from '@/features/urls/lib/urlMappings';
import * as urlsApi from '@/features/urls/api/urlsApi';
import UserUrlMappingsPage from '@/features/urls/routes/UserUrlMappingsPage';

vi.mock('@/features/urls/api/urlsApi', () => ({
  getAllUserUrls: vi.fn(),
  deleteUrl: vi.fn(),
}));

vi.mock('@/features/account/ui/layout/AccountSidebar', () => ({
  default: () => <aside>Side Panel</aside>,
}));

const mockGetAllUserUrls = vi.mocked(urlsApi.getAllUserUrls);
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
    mockGetAllUserUrls.mockResolvedValue([mapping]);

    render(
      <MemoryRouter>
        <UserUrlMappingsPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Feb 1, 2024/i)).toBeInTheDocument();
  });

  it('shows click counts and an inline open-short-url action in the card header', async () => {
    mockGetAllUserUrls.mockResolvedValue([{ ...mapping, clickCount: 12 }]);

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

  it('backs up one client page after deleting the only item on the last page', async () => {
    mockGetAllUserUrls.mockResolvedValue(
      Array.from({ length: 7 }, (_, index) => ({
        ...mapping,
        urlHash: `hash-${index}`,
        shortUrl: `https://sho.rt/hash-${index}`,
      })),
    );
    mockDeleteUrl.mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <UserUrlMappingsPage />
      </MemoryRouter>
    );

    await userEvent.click(await screen.findByRole('button', { name: '2' }));
    expect(screen.getByText('7–7')).toBeInTheDocument();

    await userEvent.click(screen.getByTitle('Delete URL'));
    await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(mockDeleteUrl).toHaveBeenCalledWith('hash-6'));
    expect(screen.queryByRole('button', { name: '2' })).not.toBeInTheDocument();
  });

  it('shows the backend access-denied message when deletion is forbidden', async () => {
    mockGetAllUserUrls.mockResolvedValue([mapping]);
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
    mockGetAllUserUrls.mockResolvedValue([mapping]);

    render(
      <MemoryRouter>
        <UserUrlMappingsPage />
      </MemoryRouter>
    );

    await userEvent.click(await screen.findByTitle('Delete URL'));

    expect(screen.getByText('Delete URL?')).toBeInTheDocument();
    expect(mockDeleteUrl).not.toHaveBeenCalled();
  });

  it('clears hidden selections after moving to a different page', async () => {
    mockGetAllUserUrls.mockResolvedValue([
      ...Array.from({ length: 6 }, (_, index) => ({
        ...mapping,
        urlHash: `hash-${index}`,
        shortUrl: `https://sho.rt/hash-${index}`,
      })),
      { ...mapping, urlHash: 'xyz789', shortUrl: 'https://sho.rt/xyz789' },
    ]);

    render(
      <MemoryRouter>
        <UserUrlMappingsPage />
      </MemoryRouter>
    );

    const [domainLabel] = await screen.findAllByText('example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Select' }));
    await userEvent.click(domainLabel);

    expect(screen.getByText('1 selected')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '2' }));

    expect(screen.getByText('7–7')).toBeInTheDocument();
    expect(screen.getByText('Select URLs')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
  });
});
