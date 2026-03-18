import { apiClient } from '@/lib/api/client';
import { settingsSchema, type Preferences, type SettingsData } from '@/lib/types/settingsSchema';

export async function fetchSettings(): Promise<SettingsData> {
  return apiClient.get('/api/settings', settingsSchema);
}

export async function saveSettings(preferences: Preferences): Promise<SettingsData> {
  return apiClient.post('/api/settings', preferences, settingsSchema);
}
