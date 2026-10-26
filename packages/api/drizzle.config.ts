import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    host: process.env.DB_HOST ?? 'localhost',
    user: process.env.POSTGRESQL_USERNAME,
    password: process.env.POSTGRESQL_PASSWORD,
    database: process.env.POSTGRESQL_DATABASE,
    ssl: false,
  },
  migrations: {
    table: '__drizzle_migrations',
    schema: 'drizzle',
  },
});
