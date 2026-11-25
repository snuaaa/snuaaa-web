import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { requireAuth, type AuthEnvironment } from '../auth';
import { validationHook } from '../errors';
import {
  deleteExhibition,
  updateExhibition,
} from '../../services/exhibition.service';
import { createExhibitPhoto } from '../../services/exhibitPhoto.service';
import { exhibitPhotoFields } from './exhibitPhoto';

/**
 * The details of an exhibition form. Every value of a multipart form is a
 * string: `exhibition_no` must be a positive whole number, and the dates are
 * whatever `Date` parses (the web sends `Date.prototype.toString()`).
 */
export const exhibitionFields = {
  title: z.string().max(128).optional(),
  text: z.string().optional(),
  category_id: z.string().max(16).optional(),
  exhibition_no: z.coerce
    .number()
    .int()
    .positive()
    .max(2_147_483_647)
    .optional(),
  slogan: z.string().max(64).optional(),
  date_start: z.coerce.date().optional(),
  date_end: z.coerce.date().optional(),
  place: z.string().max(64).optional(),
};

/** An attached image, read into memory. */
export async function readFile(file: File) {
  return Buffer.from(await file.arrayBuffer());
}

const updateForm = z.object({
  ...exhibitionFields,
  poster: z.instanceof(File).optional(),
});

/** The photo's details come as JSON in `photoInfo`. */
const exhibitPhotoForm = z.object({
  board_id: z.string(),
  category_id: z.string().max(16).optional(),
  photoInfo: z
    .string()
    .transform((text, context) => {
      try {
        return JSON.parse(text) as unknown;
      } catch {
        context.addIssue({ code: 'custom', message: 'photoInfo is not JSON' });
        return z.NEVER;
      }
    })
    .pipe(z.object(exhibitPhotoFields)),
  exhibitPhoto: z.instanceof(File, {
    message: 'EXHIBITPHOTO IS NOT ATTACHED',
  }),
});

/** `/api/exhibition/...`. Reading exhibitions (`GET`) is still on Express. */
export const exhibitionRoutes = new Hono<AuthEnvironment>()
  .use(requireAuth)
  .patch(
    '/:exhibition_id',
    zValidator('form', updateForm, validationHook),
    async (context) => {
      const { poster, ...input } = context.req.valid('form');
      await updateExhibition(
        context.get('actor'),
        context.req.param('exhibition_id'),
        input,
        poster ? await readFile(poster) : undefined,
      );
      return context.json({ success: true });
    },
  )
  .delete('/:exhibition_id', async (context) => {
    await deleteExhibition(
      context.get('actor'),
      context.req.param('exhibition_id'),
    );
    return context.json({ success: true });
  })
  .post(
    '/:exhibition_id/exhibitPhoto',
    zValidator('form', exhibitPhotoForm, validationHook),
    async (context) => {
      const form = context.req.valid('form');
      await createExhibitPhoto(
        context.get('actor'),
        context.req.param('exhibition_id'),
        { boardId: form.board_id, categoryId: form.category_id },
        form.photoInfo,
        await readFile(form.exhibitPhoto),
      );
      return context.json({ success: true });
    },
  );
