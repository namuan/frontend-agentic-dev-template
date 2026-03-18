import { z } from 'zod';
import { apiClient } from '@/lib/api/client';
import { sessionResponseSchema, sessionSchema, type Session } from '@/lib/types/sessionSchema';
import { loginSchema, type LoginPayload } from './types';

const logoutSchema = z.object({ ok: z.boolean() });

export async function fetchSession(): Promise<Session | null> {
  const response = await apiClient.get('/api/session', sessionResponseSchema);
  return response.session;
}

export async function login(payload: LoginPayload): Promise<Session> {
  const validated = loginSchema.parse(payload);
  return apiClient.post('/api/login', validated, sessionSchema);
}

export async function logout(): Promise<void> {
  await apiClient.post('/api/logout', {}, logoutSchema);
}
