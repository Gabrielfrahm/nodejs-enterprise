import { z } from 'zod';

export const environmentSchema = z.enum(['test', 'development', 'production']);

export const DatabaseSchema = z.object({
  host: z.string(),
  database: z.string(),
  password: z.string(),
  port: z.coerce.number(),
  url: z.string().startsWith('postgresql://'),
  username: z.string(),
});

export const MovieDBSchema = z.object({
  apiToken: z.string(),
  url: z.string(),
});

export const configSchema = z.object({
  env: environmentSchema,
  port: z.coerce.number().positive().int(),
  database: DatabaseSchema,
  movieDB: MovieDBSchema,
});
