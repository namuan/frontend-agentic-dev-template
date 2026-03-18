import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  accessCode: z.string().min(6),
});

export type LoginPayload = z.infer<typeof loginSchema>;
