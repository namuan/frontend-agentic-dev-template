import { useQuery } from '@tanstack/react-query';
import type { DashboardData } from '@/lib/types/dashboardSchema';
import { fetchDashboard } from '../api';

export function useDashboardData(): {
  data: DashboardData | undefined;
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
} {
  const query = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
    throwOnError: false,
  });

  return {
    data: query.data,
    isLoading: query.isPending,
    error: query.error,
    refetch: () => {
      void query.refetch();
    },
  };
}
