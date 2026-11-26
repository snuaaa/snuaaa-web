import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { requireAuth, type AuthEnvironment } from '../auth';
import { BadRequestError } from '../../errors';
import { uploadImage } from '../../services/upload.service';
import { S3_RESOURCE_TYPES } from '../../utils/upload';
import { readFile } from './exhibition';

const imageForm = z.object({
  image: z.instanceof(File, { message: 'Image is not attached' }),
});

const imageQuery = z.object({
  type: z.enum(S3_RESOURCE_TYPES, {
    message: 'Invalid or missing resource type',
  }),
  // Like Express, only the exact string 'true' asks for a thumbnail.
  thumbnail: z
    .string()
    .optional()
    .transform((value) => value === 'true'),
});

/**
 * Answers a failed check with its own message alone, the one Express sent
 * (without the field name `validationHook` adds).
 */
function messageOnlyHook(result: {
  success: boolean;
  error?: { issues: { message: string }[] };
}) {
  if (!result.success) {
    throw new BadRequestError(
      result.error?.issues[0]?.message ?? 'Invalid request',
    );
  }
}

/** `/api/upload/...`: image uploads to S3. */
export const uploadRoutes = new Hono<AuthEnvironment>().use(requireAuth).post(
  '/image',
  // The form first, so a missing image is reported before the query.
  zValidator('form', imageForm, messageOnlyHook),
  zValidator('query', imageQuery, messageOnlyHook),
  async (context) => {
    const { type, thumbnail } = context.req.valid('query');
    const urls = await uploadImage(
      await readFile(context.req.valid('form').image),
      type,
      thumbnail,
    );
    return context.json({ ...urls, result: 'success' });
  },
);
