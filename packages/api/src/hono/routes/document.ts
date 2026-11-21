import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { requireAuth, type AuthEnvironment } from '../auth';
import { validationHook } from '../errors';
import {
  deleteDocument,
  updateDocument,
} from '../../services/document.service';

const documentFields = {
  title: z.string().nullish(),
  text: z.string().nullish(),
  category_id: z.string().nullish(),
};

export const createDocumentBody = z.object({
  ...documentFields,
  // The web sends a number. Like Express did, any falsy value ('', 0,
  // null) means "no generation" and is stored as null.
  generation: z.preprocess(
    (value) => value || null,
    z.coerce.number().int().positive().max(2_147_483_647).nullable(),
  ),
});

const updateBody = z.object(documentFields);

/** `/api/document/...`. Reading documents (`GET`) is still on Express. */
export const documentRoutes = new Hono<AuthEnvironment>()
  .use(requireAuth)
  .patch(
    '/:doc_id',
    zValidator('json', updateBody, validationHook),
    async (context) => {
      await updateDocument(
        context.get('actor'),
        context.req.param('doc_id'),
        context.req.valid('json'),
      );
      return context.json({ success: true });
    },
  )
  .delete('/:doc_id', async (context) => {
    await deleteDocument(context.get('actor'), context.req.param('doc_id'));
    return context.json({ success: true });
  });
