import type { DashboardData } from '@/lib/types/dashboardSchema';
import type { Session } from '@/lib/types/sessionSchema';
import type { SettingsData } from '@/lib/types/settingsSchema';

const user = {
  id: 'user-001',
  name: 'Avery Quinn',
  email: 'avery.quinn@northstar.ai',
  role: 'owner' as const,
};

let session: Session | null = null;

const dashboard: DashboardData = {
  summary: {
    healthy: 8,
    watch: 2,
    critical: 1,
  },
  signals: [
    {
      id: 'sig-1',
      title: 'Autopilot Fleet',
      status: 'stable',
      owner: 'Ops North',
      lastChecked: '2026-03-17T08:12:00.000Z',
    },
    {
      id: 'sig-2',
      title: 'Risk Models',
      status: 'watch',
      owner: 'Finance Lab',
      lastChecked: '2026-03-17T07:45:00.000Z',
    },
    {
      id: 'sig-3',
      title: 'Incident Response',
      status: 'critical',
      owner: 'Security Grid',
      lastChecked: '2026-03-17T06:02:00.000Z',
    },
  ],
};

let settings: SettingsData = {
  user,
  preferences: {
    theme: 'midnight',
    notifications: true,
    weeklyDigest: false,
  },
};

export function getSession(): Session | null {
  return session;
}

export function setSession(next: Session): void {
  session = next;
}

export function resetSession(): void {
  session = null;
}

export function getDashboardData(): DashboardData {
  return dashboard;
}

export function getSettings(): SettingsData {
  return settings;
}

export function updateSettings(next: Partial<SettingsData['preferences']>): SettingsData {
  settings = {
    ...settings,
    preferences: { ...settings.preferences, ...next },
  };
  return settings;
}

export function createSession(): Session {
  return {
    user,
    token: 'demo-token-2026-aurora',
    expiresAt: '2026-04-17T08:00:00.000Z',
  };
}
