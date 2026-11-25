import { Hono, type MiddlewareHandler } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { requireAuth, type AuthEnvironment } from '../auth';
import { validationHook } from '../errors';
import EquipmentStatusEnum from '../../enums/equipmentStatusEnum';
import {
  assertEquipmentAdmin,
  createCategory,
  createEquipment,
  deleteCategory,
  deleteEquipment,
  listCategories,
  listEquipment,
  renameCategory,
  updateEquipment,
} from '../../services/equipment.service';

const ID = z.number().int().positive().max(2_147_483_647);

/**
 * The admin form's fields (`CreateEquipmentRequest` on the web), with the
 * columns' sizes. The form sends every field, with empty strings for blank
 * ones.
 */
const equipmentFields = z.object({
  category_id: ID.nullish(),
  name: z.string().max(256).nullish(),
  nickname: z.string().max(256).nullish(),
  description: z.string().nullish(),
  location: z.string().max(64).nullish(),
  maker: z.string().max(64).nullish(),
  status: z
    .enum(Object.values(EquipmentStatusEnum) as [string, ...string[]])
    .optional(),
  img_path: z.string().max(256).nullish(),
});

/** An empty query value means no filter, as it always has. */
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess(
    (value) => (value === '' ? undefined : value),
    schema.optional(),
  );

const searchQuery = z.object({
  category_id: optional(z.coerce.number().int().max(2_147_483_647)),
  status: optional(z.string()),
  keyword: optional(z.string()),
});

const categoryName = z.string().max(256);

/**
 * Refuses a member who doesn't manage the equipment before the body is
 * validated, so they get a 403 whatever they send, as on Express. The
 * services check it again.
 */
const adminOnly: MiddlewareHandler<AuthEnvironment> = async (context, next) => {
  assertEquipmentAdmin(context.get('actor'));
  await next();
};

/**
 * `/api/equipment/...`: the equipment and its categories. Rents (`/rent...`,
 * `/:id/rents`) are still on Express.
 */
export const equipmentRoutes = new Hono<AuthEnvironment>()
  .use(requireAuth)
  .get('/', async (context) => context.json(await listEquipment()))
  .get(
    '/search',
    zValidator('query', searchQuery, validationHook),
    async (context) => {
      const query = context.req.valid('query');
      return context.json(
        await listEquipment(
          {
            categoryId: query.category_id,
            status: query.status,
            keyword: query.keyword,
          },
          { fullRenter: true },
        ),
      );
    },
  )
  .post(
    '/',
    adminOnly,
    zValidator('json', equipmentFields, validationHook),
    async (context) =>
      context.json(
        await createEquipment(context.get('actor'), context.req.valid('json')),
      ),
  )
  .patch(
    '/',
    adminOnly,
    zValidator('json', equipmentFields.extend({ id: ID }), validationHook),
    async (context) => {
      const { id, ...fields } = context.req.valid('json');
      return context.json(
        await updateEquipment(context.get('actor'), id, fields),
      );
    },
  )
  .delete('/:id', async (context) => {
    const id = context.req.param('id');
    await deleteEquipment(context.get('actor'), id);
    // The id as given, a string, as it always has been.
    return context.json({ success: true, id });
  })
  .get('/category', async (context) => context.json(await listCategories()))
  .post(
    '/category',
    adminOnly,
    zValidator('json', z.object({ name: categoryName }), validationHook),
    async (context) =>
      context.json(
        await createCategory(
          context.get('actor'),
          context.req.valid('json').name,
        ),
      ),
  )
  .patch(
    '/category',
    adminOnly,
    zValidator(
      'json',
      z.object({ id: ID, name: categoryName }),
      validationHook,
    ),
    async (context) => {
      const { id, name } = context.req.valid('json');
      return context.json(await renameCategory(context.get('actor'), id, name));
    },
  )
  .delete('/category/:categoryId', async (context) => {
    const id = await deleteCategory(
      context.get('actor'),
      context.req.param('categoryId'),
    );
    return context.json({ success: true, id });
  });
