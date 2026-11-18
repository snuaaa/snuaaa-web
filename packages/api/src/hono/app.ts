import { Hono } from 'hono';
import { onError } from './errors';
import { commentRoutes, contentCommentRoutes } from './routes/comment';

/**
 * The endpoints already moved from Express to Hono (#158). `hono/bridge.ts`
 * hands Express the requests that match one of these routes; everything else
 * stays with the Express routers in `routes/`.
 *
 * Every route here requires a token unless its router says otherwise; list
 * new ones in `test/contract/auth-required.test.ts` like Express routes.
 */
export const honoApp = new Hono()
  .basePath('/api')
  .route('/comment', commentRoutes)
  .route('/content', contentCommentRoutes);

honoApp.onError(onError);
