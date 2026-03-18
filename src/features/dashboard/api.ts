import { apiClient } from '@/lib/api/client';
import { dashboardSchema, type DashboardData } from '@/lib/types/dashboardSchema';

export async function fetchDashboard(): Promise<DashboardData> {
  return apiClient.get('/api/dashboard', dashboardSchema);
}
