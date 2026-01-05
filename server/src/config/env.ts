import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().url(),

  DB_HOST: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string(),
  DB_PORT: z.string().default('3306'),

  JWT_SECRET: z.string().min(10, "Le JWT Secret doit être long !"),
  JWT_EXPIRES_IN: z.string().default('7d'),

  LOGTAIL_SOURCE_TOKEN: z.string().optional(),
});

const envParsed = envSchema.safeParse(process.env);

if (!envParsed.success) {
  console.error('FATAL ERROR: INVALID CONFIGURATION (.ENV)');
  console.error(JSON.stringify(envParsed.error.format(), null, 2));
  process.exit(1);
}

export const config = envParsed.data;