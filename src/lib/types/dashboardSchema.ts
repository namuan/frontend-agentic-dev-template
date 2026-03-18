import { z } from 'zod';

export const signalSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  status: z.enum(['stable', 'watch', 'critical']),
  owner: z.string().min(1),
  lastChecked: z.string().datetime(),
});

export const dashboardSchema = z.object({
  summary: z.object({
    healthy: z.number().nonnegative(),
    watch: z.number().nonnegative(),
    critical: z.number().nonnegative(),
  }),
  signals: z.array(signalSchema),
});

export type Signal = z.infer<typeof signalSchema>;
export type DashboardData = z.infer<typeof dashboardSchema>;
