// [LOAD PACKAGES]
import './instrument';
import * as Sentry from '@sentry/node';
import app from './app';
import { runMigrations } from './db/migrate';

// [CONFIGURE SERVER PORT]
const port = process.env.PORT || 8080;

// [RUN SERVER]
// Bring the DB schema up to date before serving any request.
runMigrations()
  .then(() => {
    app.listen(port, () => console.log(`Server listening on port ${port}`));
  })
  .catch(async (e) => {
    console.error('Failed to run database migrations >> ', e);
    Sentry.captureException(e);
    await Sentry.flush(2000);
    process.exit(1);
  });
