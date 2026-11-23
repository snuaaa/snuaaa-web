import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { requireAuth, type AuthEnvironment } from '../auth';
import { validationHook } from '../errors';
import {
  deleteOfficers,
  listOfficers,
  saveOfficers,
} from '../../services/officer.service';

const name = z.string().trim().min(1).max(32);

const officersBody = z.object({
  roles: z
    .array(
      z.object({
        role: name,
        names: z.array(name).min(1).max(30),
      }),
    )
    .min(1)
    .max(50),
});

const generationParam = z.object({
  generation: z.coerce.number().int().positive().max(9999),
});

/** `/api/officers`: 역대 회장단/임원진, one entry per 기수. */
export const officerRoutes = new Hono<AuthEnvironment>()
  .use(requireAuth)
  .get('/', async (context) => {
    const generations = await listOfficers();
    return context.json({ success: true, generations });
  })
  .put(
    '/:generation',
    zValidator('param', generationParam, validationHook),
    zValidator('json', officersBody, validationHook),
    async (context) => {
      const generation = await saveOfficers(
        context.get('actor'),
        context.req.valid('param').generation,
        context.req.valid('json').roles,
      );
      return context.json({ success: true, generation });
    },
  )
  .delete(
    '/:generation',
    zValidator('param', generationParam, validationHook),
    async (context) => {
      await deleteOfficers(
        context.get('actor'),
        context.req.valid('param').generation,
      );
      return context.json({ success: true });
    },
  );
