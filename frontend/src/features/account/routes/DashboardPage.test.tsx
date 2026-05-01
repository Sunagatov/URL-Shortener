import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DashboardPage from '@/features/account/routes/DashboardPage';
import { useDashboardOverview } from '@/features/account/model/useDashboardOverview';

vi.mock('@/features/account/model/useDashboardOverview', () => ({
  useDashboardOverview: vi.fn(),
}));

vi.mock('@/features/account/ui/layout/AccountSidebar', () => ({
  default: () => <aside>Side Panel</aside>,
}));

const mockUseDashboardOverview = vi.mocked(useDashboardOverview);

const renderDashboard = () =>
  render(
    <MemoryRouter initialEntries={['/account/dashboard']}>
      <Routes>
        <Route path="/account/dashboard" element={<DashboardPage />} />
      </Routes>
    </MemoryRouter>
  );

describe('DashboardPage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard summary cards and empty dashboard states', () => {
    mockUseDashboardOverview.mockReturnValue({
      activity: [],
      error: null,
      isLoading: false,
      recentUrls: [],
      refetch: vi.fn(),
      stats: [
        { label: 'Total URLs Created', value: '0', changeLabel: 'No data yet' },
        { label: 'Total Clicks', value: '0', changeLabel: 'No clicks yet' },
        { label: 'Avg. Links / Month', value: '0.0', changeLabel: 'Build your first month' },
        { label: 'Clicks per URL', value: '0.0', changeLabel: 'Traffic will show here' },
      ],
    });

    renderDashboard();

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Total URLs Created')).toBeInTheDocument();
    expect(screen.getByText('No URLs yet.')).toBeInTheDocument();
    expect(screen.getByText('Activity will appear after you create links.')).toBeInTheDocument();
  });

  it('calls refetch from the live overview banner', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();

    mockUseDashboardOverview.mockReturnValue({
      activity: [],
      error: null,
      isLoading: false,
      recentUrls: [],
      refetch,
      stats: [
        { label: 'Total URLs Created', value: '1', changeLabel: '1 month view' },
        { label: 'Total Clicks', value: '5', changeLabel: 'Tracked across your links' },
        { label: 'Avg. Links / Month', value: '1.0', changeLabel: 'Based on creation history' },
        { label: 'Clicks per URL', value: '5.0', changeLabel: 'Useful engagement baseline' },
      ],
    });

    renderDashboard();

    await user.click(screen.getByRole('button', { name: /refresh/i }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
