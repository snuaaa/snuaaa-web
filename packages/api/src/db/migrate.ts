// Applies pending migrations in `drizzle/`.
// Usage: `pnpm db:migrate` (ts-node) or `node dist/db/migrate.js` (built image).
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import {
  createClient,
  MIGRATIONS_FOLDER,
  MIGRATIONS_SCHEMA,
  MIGRATIONS_TABLE,
} from './connection';

async function main() {
  const client = createClient();
  await client.connect();
  try {
    await migrate(drizzle(client), {
      migrationsFolder: MIGRATIONS_FOLDER,
      migrationsSchema: MIGRATIONS_SCHEMA,
      migrationsTable: MIGRATIONS_TABLE,
    });
    console.log('Migrations applied');
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error('Migration failed >> ', e);
  process.exit(1);
});
