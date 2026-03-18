import { z } from 'zod';

export const userSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['owner', 'analyst', 'viewer']),
});

export type User = z.infer<typeof userSchema>;
