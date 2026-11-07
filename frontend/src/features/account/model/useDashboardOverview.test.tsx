import { act, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useDashboardOverview } from './useDashboardOverview';
import { getUserUrlsUpTo } from '@/shared/api/urlMappingsApi';
import { ToastProvider } from '@/shared/ui/Toast';

vi.mock('@/shared/api/urlMappingsApi', () => ({ getUserUrlsUpTo: vi.fn() }));

describe('dashboard error recovery', () => {
  afterEach(() => vi.clearAllMocks());

  it('does not refetch when an error toast appears or is dismissed', async () => {
    vi.mocked(getUserUrlsUpTo).mockRejectedValue(new Error('Network Error'));
    const { result } = renderHook(useDashboardOverview, { wrapper: ToastProvider });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe('Network Error');
    expect(getUserUrlsUpTo).toHaveBeenCalledTimes(1);
    expect(screen.getAllByText('Network Error')).toHaveLength(1);

    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull());
    expect(getUserUrlsUpTo).toHaveBeenCalledTimes(1);

    vi.mocked(getUserUrlsUpTo).mockResolvedValue([]);
    await act(() => result.current.refetch());
    expect(result.current.error).toBeNull();
    expect(getUserUrlsUpTo).toHaveBeenCalledTimes(2);
  });
});
