import { renderHook, waitFor } from '@testing-library/react';
import { createSession, resetSession, setSession } from '@/mocks/data';
import { createWrapper } from '../../../../tests/fixtures/testUtils';
import { useAuth } from './useAuth';
import * as authApi from '../api';

// Mock the auth API functions
jest.mock('../api', () => ({
  fetchSession: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
}));

const mockedFetchSession = authApi.fetchSession as jest.MockedFunction<typeof authApi.fetchSession>;

describe('useAuth', () => {
  beforeEach(() => {
    resetSession();
    jest.clearAllMocks();
    // Set a default mock implementation
    mockedFetchSession.mockResolvedValue(null);
  });

  it('starts in a loading state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });
    expect(result.current.isLoading).toBe(true);
  });

  it('returns a session when available', async () => {
    const session = createSession();
    setSession(session);
    mockedFetchSession.mockResolvedValue(session);

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.session?.user.name).toBe('Avery Quinn');
    });
  });

  it('surfaces an error when the session request fails', async () => {
    mockedFetchSession.mockRejectedValue(new Error('Server error'));

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });
});
