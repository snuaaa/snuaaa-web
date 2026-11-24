import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { requireAuth, type AuthEnvironment } from '../auth';
import { validationHook } from '../errors';
import {
  deleteDocument,
  listDocuments,
  retrieveDocument,
  updateDocument,
} from '../../services/document.service';
import { pageNumber } from './query';

/** The columns' sizes: `tb_content.title` and `category_id` are varchars. */
const documentFields = {
  title: z.string().max(128).nullish(),
  text: z.string().nullish(),
  category_id: z.string().max(16).nullish(),
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

const listQuery = z.object({
  // Like Express did, a page that isn't a positive number is the first.
  page: pageNumber(1),
  category: z.string().optional(),
  // An empty generation lists every generation.
  generation: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.coerce.number().int().min(-2_147_483_648).max(2_147_483_647).optional(),
  ),
});

/** `/api/document/...`. */
export const documentRoutes = new Hono<AuthEnvironment>()
  .use(requireAuth)
  .get('/', zValidator('query', listQuery, validationHook), async (context) => {
    const query = context.req.valid('query');
    const { count, rows } = await listDocuments({
      page: query.page,
      categoryId: query.category || undefined,
      generation: query.generation,
    });
    return context.json({ docCount: count, docInfo: rows });
  })
  .get('/:doc_id', async (context) => {
    const { content, liked } = await retrieveDocument(
      context.get('actor'),
      context.req.param('doc_id'),
    );
    return context.json({ docuInfo: content, likeInfo: liked });
  })
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
