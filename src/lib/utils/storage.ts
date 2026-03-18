import { z } from 'zod';
import { logger } from './logger';

export function readFromStorage<T>(key: string, schema: z.ZodType<T>): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return schema.parse(JSON.parse(raw));
  } catch (error) {
    logger.warn('Failed to read from storage', { key, error });
    localStorage.removeItem(key);
    return null;
  }
}

export function writeToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    logger.warn('Failed to write to storage', { key, error });
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    logger.warn('Failed to remove from storage', { key, error });
  }
}
