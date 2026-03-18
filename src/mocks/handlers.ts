import { rest } from 'msw';
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
  rest.get('/api/session', async (req, res, ctx) => {
    await delay(200);
    return res(ctx.json({ session: getSession() }));
  }),
  rest.post('/api/login', async (req, res, ctx) => {
    await delay(300);
    const session = createSession();
    setSession(session);
    return res(ctx.json(session));
  }),
  rest.post('/api/logout', async (req, res, ctx) => {
    await delay(150);
    resetSession();
    return res(ctx.json({ ok: true }));
  }),
  rest.get('/api/dashboard', async (req, res, ctx) => {
    await delay(250);
    return res(ctx.json(getDashboardData()));
  }),
  rest.get('/api/settings', async (req, res, ctx) => {
    await delay(250);
    return res(ctx.json(getSettings()));
  }),
  rest.post('/api/settings', async (req, res, ctx) => {
    await delay(250);
    const body = req.body as Partial<{ theme: string; notifications: boolean; weeklyDigest: boolean }>;
    const settings = updateSettings({
      theme: body.theme === 'dawn' ? 'dawn' : 'midnight',
      notifications: Boolean(body.notifications),
      weeklyDigest: Boolean(body.weeklyDigest),
    });
    return res(ctx.json(settings));
  }),
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
