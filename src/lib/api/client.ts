import { z } from 'zod';
import { ApiError, ParseError } from './errors';

async function request<T>(
  path: string,
  options: RequestInit,
  schema: z.ZodType<T>
): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new ApiError(response.status, body);
  }

  const json = (await response.json()) as unknown;
  try {
    return schema.parse(json);
  } catch (error) {
    throw new ParseError(error);
  }
}

export const apiClient = {
  get: <T>(path: string, schema: z.ZodType<T>): Promise<T> =>
    request(path, { method: 'GET' }, schema),
  post: <T, B>(path: string, body: B, schema: z.ZodType<T>): Promise<T> =>
    request(path, { method: 'POST', body: JSON.stringify(body) }, schema),
};
