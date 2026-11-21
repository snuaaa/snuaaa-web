import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { AppError } from '../errors';
import { onError } from './errors';
import { commentRoutes, contentCommentRoutes } from './routes/comment';
import { boardPostRoutes, postRoutes } from './routes/post';

/**
 * The largest request body Hono reads, the same as the default limit of
 * Express's `bodyParser.json()`. The bridge hands Hono the raw request before
 * the Express body parsers run, so their limit doesn't apply here.
 */
const MAXIMUM_BODY_BYTES = 100 * 1024;

/**
 * The endpoints already moved from Express to Hono (#158). `hono/bridge.ts`
 * hands Hono the requests that match one of these routes; everything else
 * stays with the Express routers in `routes/`.
 *
 * Every route here requires a token unless its router says otherwise; list
 * new ones in `test/contract/auth-required.test.ts` like Express routes.
 */
// `strict: false` ignores a trailing slash, like Express.
export const honoApp = new Hono({ strict: false })
  .basePath('/api')
  .use(
    bodyLimit({
      maxSize: MAXIMUM_BODY_BYTES,
      // The same status and message as body-parser's limit in Express.
      onError: () => {
        throw new AppError(413, 'BAD_REQUEST', 'request entity too large');
      },
    }),
  )
  .route('/board', boardPostRoutes)
  .route('/comment', commentRoutes)
  .route('/content', contentCommentRoutes)
  .route('/post', postRoutes);

honoApp.onError(onError);
