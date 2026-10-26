import 'dotenv/config';
import path from 'path';
import { Client } from 'pg';

// Works from both src/db (ts-node) and dist/db (compiled).
export const MIGRATIONS_FOLDER = path.resolve(__dirname, '../../drizzle');
export const MIGRATIONS_SCHEMA = 'drizzle';
export const MIGRATIONS_TABLE = '__drizzle_migrations';

export function createClient() {
  return new Client({
    host: process.env.DB_HOST ?? 'localhost',
    user: process.env.POSTGRESQL_USERNAME,
    password: process.env.POSTGRESQL_PASSWORD,
    database: process.env.POSTGRESQL_DATABASE,
  });
}
