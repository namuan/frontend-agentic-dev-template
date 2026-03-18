import { renderHook, waitFor } from '@testing-library/react';
import { createWrapper } from '../../../../tests/fixtures/testUtils';
import { useDashboardData } from './useDashboardData';
import * as dashboardApi from '../api';
import { getDashboardData } from '@/mocks/data';

// Mock the dashboard API functions
jest.mock('../api', () => ({
  fetchDashboard: jest.fn(),
}));

const mockedFetchDashboard = dashboardApi.fetchDashboard as jest.MockedFunction<typeof dashboardApi.fetchDashboard>;

describe('useDashboardData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts in a loading state', () => {
    const { result } = renderHook(() => useDashboardData(), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(true);
  });

  it('returns dashboard data on success', async () => {
    const dashboardData = getDashboardData();
    mockedFetchDashboard.mockResolvedValue(dashboardData);

    const { result } = renderHook(() => useDashboardData(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.data?.summary.healthy).toBe(8);
    });
  });

  it('surfaces an error when the request fails', async () => {
    mockedFetchDashboard.mockRejectedValue(new Error('Server error'));

    const { result } = renderHook(() => useDashboardData(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });
});
