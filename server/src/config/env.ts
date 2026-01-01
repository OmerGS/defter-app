import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  DB_HOST: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string(),
  DB_PORT: z.string().default('3306'),

  JWT_SECRET: z.string().min(10, "Le JWT Secret doit être long !"),
});

const envParsed = envSchema.safeParse(process.env);

if (!envParsed.success) {
  console.error('CONFIGURATION .ENV INVALIDE :', envParsed.error.format());
  process.exit(1);
}

export const config = envParsed.data;