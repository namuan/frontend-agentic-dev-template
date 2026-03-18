import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/lib/hooks/useToast';

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        throwOnError: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function createWrapper(): React.FC<{ children: React.ReactNode }> {
  const queryClient = createTestQueryClient();

  return function Wrapper({ children }: { children: React.ReactNode }): React.ReactElement {
    return (
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    );
  };
}
