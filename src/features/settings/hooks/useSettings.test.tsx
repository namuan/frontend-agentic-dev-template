import { renderHook, waitFor } from '@testing-library/react';
import { createWrapper } from '../../../../tests/fixtures/testUtils';
import { useSettings } from './useSettings';
import * as settingsApi from '../api';
import { getSettings } from '@/mocks/data';

// Mock the settings API functions
jest.mock('../api', () => ({
  fetchSettings: jest.fn(),
}));

const mockedFetchSettings = settingsApi.fetchSettings as jest.MockedFunction<typeof settingsApi.fetchSettings>;

describe('useSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts in a loading state', () => {
    const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(true);
  });

  it('returns settings data on success', async () => {
    const settings = getSettings();
    mockedFetchSettings.mockResolvedValue(settings);

    const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.data?.user.email).toBe('avery.quinn@northstar.ai');
    });
  });

  it('surfaces an error when the request fails', async () => {
    mockedFetchSettings.mockRejectedValue(new Error('Server error'));

    const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });
});
