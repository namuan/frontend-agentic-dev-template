import { z } from 'zod';
import { userSchema } from './userSchema';

export const preferencesSchema = z.object({
  theme: z.enum(['midnight', 'dawn']),
  notifications: z.boolean(),
  weeklyDigest: z.boolean(),
});

export const settingsSchema = z.object({
  user: userSchema,
  preferences: preferencesSchema,
});

export type Preferences = z.infer<typeof preferencesSchema>;
export type SettingsData = z.infer<typeof settingsSchema>;
