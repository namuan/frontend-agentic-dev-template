import { z } from 'zod';
import { userSchema } from './userSchema';

export const sessionSchema = z.object({
  user: userSchema,
  token: z.string().min(10),
  expiresAt: z.string().datetime(),
});

export const sessionResponseSchema = z.object({
  session: sessionSchema.nullable(),
});

export type Session = z.infer<typeof sessionSchema>;
export type SessionResponse = z.infer<typeof sessionResponseSchema>;
