import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/lib/hooks/useToast';
import { fetchSession, login, logout } from '../api';
import type { LoginPayload } from '../types';
import type { Session } from '@/lib/types/sessionSchema';

export function useAuth(): {
  session: Session | null;
  isLoading: boolean;
  error: unknown;
  login: (payload: LoginPayload) => Promise<void>;
  isLoggingIn: boolean;
  loginError: unknown;
  logout: () => Promise<void>;
  isLoggingOut: boolean;
  refetch: () => void;
} {
  const queryClient = useQueryClient();
  const { push } = useToast();

  const sessionQuery = useQuery<Session | null>({
    queryKey: ['session'],
    queryFn: fetchSession,
    throwOnError: false,
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      queryClient.setQueryData(['session'], session);
      push({ title: 'Access granted', description: `Welcome, ${session.user.name}`, tone: 'success' });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(['session'], null);
      push({ title: 'Signed out', description: 'Session cleared for this device', tone: 'info' });
    },
  });

  return {
    session: sessionQuery.data ?? null,
    isLoading: sessionQuery.isPending,
    error: sessionQuery.error,
    login: async (payload) => {
      await loginMutation.mutateAsync(payload);
    },
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout: async () => {
      await logoutMutation.mutateAsync();
    },
    isLoggingOut: logoutMutation.isPending,
    refetch: () => {
      void sessionQuery.refetch();
    },
  };
}
