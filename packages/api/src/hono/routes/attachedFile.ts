import { readFile } from 'fs/promises';
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { requireAuth, type AuthEnvironment } from '../auth';
import { validationHook } from '../errors';
import { NotFoundError } from '../../errors';
import {
  attachFile,
  deleteFile,
  downloadFile,
} from '../../services/attachedFile.service';

const uploadForm = z.object({
  attachedFile: z.instanceof(File, { message: 'FILE IS NOT ATTACHED' }),
});

/** A `Content-Disposition` that keeps a non-ASCII name, as `res.download` did. */
function attachment(name: string) {
  const asciiFallback = name.replace(/[^\x20-\x7E]/g, '_').replace(/"/g, '');
  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}

/** `/api/content/:content_id/file...` */
export const contentFileRoutes = new Hono<AuthEnvironment>()
  // The web links to the download without a token.
  .get('/:content_id/file/:file_id', async (context) => {
    const file = await downloadFile(
      context.req.param('content_id'),
      context.req.param('file_id'),
    );
    if (/^https?:\/\//i.test(file.location)) {
      return context.redirect(file.location);
    }
    // An old file kept on the server's disk before S3.
    const body = await readFile(file.location).catch(() => {
      throw new NotFoundError('FILE NOT FOUND');
    });
    return context.body(body, 200, {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': attachment(file.originalName ?? 'file'),
    });
  })
  .post(
    '/:content_id/file',
    requireAuth,
    zValidator('form', uploadForm, validationHook),
    async (context) => {
      const { attachedFile } = context.req.valid('form');
      await attachFile(context.get('actor'), context.req.param('content_id'), {
        buffer: Buffer.from(await attachedFile.arrayBuffer()),
        name: attachedFile.name,
        mimeType: attachedFile.type || undefined,
      });
      return context.json({ success: true });
    },
  );

/** `/api/file/...` */
export const fileRoutes = new Hono<AuthEnvironment>()
  .use(requireAuth)
  .delete('/:file_id', async (context) => {
    await deleteFile(context.get('actor'), context.req.param('file_id'));
    return context.json({ success: true });
  });
