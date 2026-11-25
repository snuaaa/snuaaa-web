import { Hono, type MiddlewareHandler } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { AppError } from '../errors';
import { onError } from './errors';
import { albumRoutes } from './routes/album';
import { contentFileRoutes, fileRoutes } from './routes/attachedFile';
import { boardRoutes } from './routes/board';
import { commentRoutes, contentCommentRoutes } from './routes/comment';
import { documentRoutes } from './routes/document';
import { equipmentRoutes } from './routes/equipment';
import { exhibitionRoutes } from './routes/exhibition';
import { exhibitPhotoRoutes } from './routes/exhibitPhoto';
import { homeRoutes } from './routes/home';
import { photoRoutes } from './routes/photo';
import { photoboardRoutes } from './routes/photoboard';
import { postRoutes } from './routes/post';
import { uploadRoutes } from './routes/upload';
import { userRoutes } from './routes/user';
import { userinfoRoutes } from './routes/userinfo';

/**
 * The largest request body Hono reads, the same as the default limit of
 * Express's `bodyParser.json()`. The bridge hands Hono the raw request before
 * the Express body parsers run, so their limit doesn't apply here.
 */
const MAXIMUM_BODY_BYTES = 100 * 1024;

/**
 * The largest multipart body (an exhibition poster or an exhibit photo).
 * Express's multer had no limit; this matches the 100MB the web lets one
 * photo upload batch reach.
 */
const MAXIMUM_UPLOAD_BYTES = 100 * 1024 * 1024;

function limitBody(maxSize: number) {
  return bodyLimit({
    maxSize,
    // The same status and message as body-parser's limit in Express.
    onError: () => {
      throw new AppError(413, 'BAD_REQUEST', 'request entity too large');
    },
  });
}

const jsonBodyLimit = limitBody(MAXIMUM_BODY_BYTES);
const uploadBodyLimit = limitBody(MAXIMUM_UPLOAD_BYTES);

/** Multipart uploads get the larger limit, every other body the JSON one. */
const limitRequestBody: MiddlewareHandler = (context, next) =>
  context.req.header('content-type')?.startsWith('multipart/form-data')
    ? uploadBodyLimit(context, next)
    : jsonBodyLimit(context, next);

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
  .use(limitRequestBody)
  .route('/album', albumRoutes)
  .route('/board', boardRoutes)
  .route('/comment', commentRoutes)
  // Before the comment routes, whose token check covers all of `/content`,
  // so the public file download answers first.
  .route('/content', contentFileRoutes)
  .route('/content', contentCommentRoutes)
  .route('/document', documentRoutes)
  .route('/equipment', equipmentRoutes)
  .route('/exhibition', exhibitionRoutes)
  .route('/exhibitPhoto', exhibitPhotoRoutes)
  .route('/file', fileRoutes)
  .route('/home', homeRoutes)
  .route('/photo', photoRoutes)
  .route('/photoboard', photoboardRoutes)
  .route('/post', postRoutes)
  .route('/upload', uploadRoutes)
  .route('/user', userRoutes)
  .route('/userinfo', userinfoRoutes);

honoApp.onError(onError);
