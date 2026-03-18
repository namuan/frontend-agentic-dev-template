import { http, HttpResponse } from 'msw';
import {
  createSession,
  getDashboardData,
  getSession,
  getSettings,
  resetSession,
  setSession,
  updateSettings,
} from './data';

export const handlers = [
  http.get('/api/session', async () => {
    await delay(200);
    return HttpResponse.json({ session: getSession() });
  }),
  http.post('/api/login', async () => {
    await delay(300);
    const session = createSession();
    setSession(session);
    return HttpResponse.json(session);
  }),
  http.post('/api/logout', async () => {
    await delay(150);
    resetSession();
    return HttpResponse.json({ ok: true });
  }),
  http.get('/api/dashboard', async () => {
    await delay(250);
    return HttpResponse.json(getDashboardData());
  }),
  http.get('/api/settings', async () => {
    await delay(250);
    return HttpResponse.json(getSettings());
  }),
  http.post('/api/settings', async ({ request }) => {
    await delay(250);
    const body = await request.json() as Partial<{ theme: string; notifications: boolean; weeklyDigest: boolean }>;
    const settings = updateSettings({
      theme: body.theme === 'dawn' ? 'dawn' : 'midnight',
      notifications: Boolean(body.notifications),
      weeklyDigest: Boolean(body.weeklyDigest),
    });
    return HttpResponse.json(settings);
  }),
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
