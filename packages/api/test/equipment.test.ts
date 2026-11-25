import { describe, expect, it } from 'vitest';
import { api } from './helpers/request';
import {
  bearer,
  createEquipment,
  createEquipmentCategory,
  createRent,
  createUser,
  type Equipment,
  type User,
} from './helpers/factories';
import {
  equipmentCategoryRows,
  equipmentRow,
  equipmentRows,
  softDeleteUser,
} from './helpers/db';

/*
 * The equipment and equipment category endpoints, with the bodies the web
 * sends (`EquipmentService`): the admin form sends every editable field,
 * with empty strings for the ones left blank.
 */

const FORBIDDEN = {
  success: false,
  error: 'FORBIDDEN',
  message: 'PERMISSION DENIED',
};

const admin = () => createUser({ grade: 6 });

function as(user: User) {
  return { Authorization: bearer(user) };
}

/** The equipment as the list endpoints and the writes answer it. */
function equipmentJson(
  equipment: Equipment,
  overrides: Record<string, unknown> = {},
) {
  return {
    id: equipment.id,
    category_id: equipment.category_id,
    name: equipment.name,
    nickname: equipment.nickname,
    description: equipment.description,
    location: equipment.location,
    maker: equipment.maker,
    status: equipment.status,
    rent_status: equipment.rent_status,
    img_path: equipment.img_path,
    createdAt: expect.any(String),
    updatedAt: expect.any(String),
    deletedAt: null,
    ...overrides,
  };
}

function userJson(user: User, overrides: Record<string, unknown> = {}) {
  return {
    user_id: user.user_id,
    user_uuid: user.user_uuid,
    nickname: user.nickname,
    introduction: null,
    grade: user.grade,
    level: user.level,
    profile_path: null,
    profile_url: null,
    deleted_at: null,
    ...overrides,
  };
}

/** The admin form's body for a new equipment. */
function formBody(categoryId: number, overrides: Record<string, unknown> = {}) {
  return {
    name: 'Dobsonian',
    nickname: 'dob',
    category_id: categoryId,
    status: 'OK',
    location: 'Club room',
    maker: 'Sky-Watcher',
    description: '',
    img_path: '',
    ...overrides,
  };
}

describe('GET /api/equipment', () => {
  it('returns every equipment by category, then id, with its current renter', async () => {
    const first = await createEquipmentCategory();
    const second = await createEquipmentCategory();
    const renter = await createUser({ grade: 7 });
    const reader = await createUser({ grade: 9 });
    const later = await createEquipment(second);
    const rented = await createEquipment(first, { rent_status: 'RENTED' });
    const free = await createEquipment(first);
    await createEquipment(first, { deleted_at: new Date() });
    const start = new Date('2024-03-01T10:00:00.000Z');
    await createRent(renter, rented, { start_date: start });
    await createRent(reader, free, { returned: true });

    const response = await api().get('/api/equipment/').set(as(reader));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      equipCount: 3,
      equipInfo: [
        {
          ...equipmentJson(rented),
          renter: { nickname: renter.nickname },
          start_date: '2024-03-01T10:00:00.000Z',
          end_date: '2024-03-03T10:00:00.000Z',
        },
        equipmentJson(free),
        equipmentJson(later),
      ],
    });
  });

  it('shows a renter who left the club', async () => {
    const renter = await createUser({ grade: 7 });
    const equipment = await createEquipment(null, { rent_status: 'RENTED' });
    await createRent(renter, equipment);
    await softDeleteUser(renter);

    const response = await api()
      .get('/api/equipment/')
      .set(as(await createUser()));

    expect(response.body.equipInfo[0].renter).toEqual({
      nickname: renter.nickname,
    });
  });
});

describe('GET /api/equipment/search', () => {
  it('returns every equipment with its renter in full when nothing is given, as the web asks', async () => {
    const category = await createEquipmentCategory();
    const renter = await createUser({ grade: 7 });
    const rented = await createEquipment(category, { rent_status: 'RENTED' });
    const free = await createEquipment(category);
    await createRent(renter, rented);

    const response = await api()
      .get('/api/equipment/search')
      .set(as(await createUser()));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      equipCount: 2,
      equipInfo: expect.arrayContaining([
        {
          ...equipmentJson(rented),
          renter: userJson(renter),
          start_date: expect.any(String),
          end_date: expect.any(String),
        },
        equipmentJson(free),
      ]),
    });
  });

  it('filters by category, status and a case-sensitive part of the name', async () => {
    const category = await createEquipmentCategory();
    const other = await createEquipmentCategory();
    const match = await createEquipment(category, { name: 'Big Dobsonian' });
    await createEquipment(other, { name: 'Big Dobsonian' });
    await createEquipment(category, { name: 'Big Dobsonian', status: 'LOST' });
    await createEquipment(category, { name: 'big dobsonian' });

    const response = await api()
      .get('/api/equipment/search')
      .query({ category_id: category.id, status: 'OK', keyword: 'Dob' })
      .set(as(await createUser()));

    expect(response.body).toEqual({
      equipCount: 1,
      equipInfo: [equipmentJson(match)],
    });
  });
});

describe('GET /api/equipment/category', () => {
  it('returns the categories that are not deleted', async () => {
    const category = await createEquipmentCategory({ name: 'Mounts' });
    await createEquipmentCategory({ deleted_at: new Date() });

    const response = await api()
      .get('/api/equipment/category')
      .set(as(await createUser()));

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: category.id, name: 'Mounts' }]);
  });
});

describe('POST /api/equipment', () => {
  it('creates a rentable equipment and returns it', async () => {
    const category = await createEquipmentCategory();

    const response = await api()
      .post('/api/equipment/')
      .set(as(await admin()))
      .send(formBody(category.id));

    expect(response.status).toBe(200);
    const [row] = await equipmentRows();
    expect(response.body).toEqual({
      id: row.id,
      category_id: category.id,
      name: 'Dobsonian',
      nickname: 'dob',
      description: '',
      location: 'Club room',
      maker: 'Sky-Watcher',
      status: 'OK',
      rent_status: 'RENTABLE',
      img_path: '',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      deletedAt: null,
    });
  });

  it('makes an equipment that is not OK unrentable', async () => {
    const category = await createEquipmentCategory();

    const response = await api()
      .post('/api/equipment/')
      .set(as(await admin()))
      .send(formBody(category.id, { status: 'BROKEN' }));

    expect(response.body.rent_status).toBe('UNRENTABLE');
    expect((await equipmentRows())[0].rent_status).toBe('UNRENTABLE');
  });

  it('refuses a member below the admin grade', async () => {
    const category = await createEquipmentCategory();

    const response = await api()
      .post('/api/equipment/')
      .set(as(await createUser({ grade: 7 })))
      .send(formBody(category.id));

    expect(response.status).toBe(403);
    expect(response.body).toEqual(FORBIDDEN);
    expect(await equipmentRows()).toEqual([]);
  });

  it('answers 400 instead of 500 for a field that is too long, and for an unknown status', async () => {
    const category = await createEquipmentCategory();
    const manager = await admin();

    for (const overrides of [
      { name: 'x'.repeat(257) },
      { location: 'x'.repeat(65) },
      { status: 'GONE' },
      { category_id: 'abc' },
    ]) {
      const response = await api()
        .post('/api/equipment/')
        .set(as(manager))
        .send(formBody(category.id, overrides));
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('BAD_REQUEST');
    }
    expect(await equipmentRows()).toEqual([]);
  });
});

describe('PATCH /api/equipment', () => {
  it('changes the fields and answers the changed row count', async () => {
    const category = await createEquipmentCategory();
    const other = await createEquipmentCategory();
    const equipment = await createEquipment(category);

    const response = await api()
      .patch('/api/equipment/')
      .set(as(await admin()))
      .send({
        ...formBody(other.id, { name: 'Renamed', img_path: 'new.jpg' }),
        id: equipment.id,
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([1]);
    expect(await equipmentRow(equipment.id)).toMatchObject({
      category_id: other.id,
      name: 'Renamed',
      nickname: 'dob',
      description: '',
      img_path: 'new.jpg',
      rent_status: 'RENTABLE',
    });
  });

  it('sets the rent status from the status and whether it is rented now', async () => {
    const category = await createEquipmentCategory();
    const renter = await createUser({ grade: 7 });
    const rented = await createEquipment(category, {
      status: 'BROKEN',
      rent_status: 'UNRENTABLE',
    });
    await createRent(renter, rented);
    const returned = await createEquipment(category, {
      status: 'BROKEN',
      rent_status: 'UNRENTABLE',
    });
    await createRent(renter, returned, { returned: true });
    const free = await createEquipment(category);
    const manager = await admin();

    const update = (equipment: Equipment, status: string) =>
      api()
        .patch('/api/equipment/')
        .set(as(manager))
        .send({ ...formBody(category.id, { status }), id: equipment.id });

    await update(rented, 'OK');
    await update(returned, 'OK');
    await update(free, 'REPAIRING');

    expect((await equipmentRow(rented.id)).rent_status).toBe('RENTED');
    expect((await equipmentRow(returned.id)).rent_status).toBe('RENTABLE');
    expect((await equipmentRow(free.id)).rent_status).toBe('UNRENTABLE');
  });

  it('answers 404 for an unknown or deleted equipment', async () => {
    const category = await createEquipmentCategory();
    const deleted = await createEquipment(category, { deleted_at: new Date() });
    const manager = await admin();

    for (const id of [999999, deleted.id]) {
      const response = await api()
        .patch('/api/equipment/')
        .set(as(manager))
        .send({ ...formBody(category.id, { name: 'Renamed' }), id });
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        error: 'NOT_FOUND',
        message: 'EQUIPMENT NOT FOUND',
      });
    }
    expect((await equipmentRow(deleted.id)).name).toBe(deleted.name);
  });

  it('refuses a member below the admin grade', async () => {
    const category = await createEquipmentCategory();
    const equipment = await createEquipment(category);

    const response = await api()
      .patch('/api/equipment/')
      .set(as(await createUser({ grade: 7 })))
      .send({
        ...formBody(category.id, { name: 'Renamed' }),
        id: equipment.id,
      });

    expect(response.status).toBe(403);
    expect(response.body).toEqual(FORBIDDEN);
    expect((await equipmentRow(equipment.id)).name).toBe(equipment.name);
  });
});

describe('DELETE /api/equipment/:id', () => {
  it('soft-deletes the equipment and answers its id as given', async () => {
    const equipment = await createEquipment(null);

    const response = await api()
      .delete(`/api/equipment/${equipment.id}`)
      .set(as(await admin()));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, id: String(equipment.id) });
    expect((await equipmentRow(equipment.id)).deleted_at).not.toBeNull();
  });

  it('answers 404 for an unknown or deleted equipment', async () => {
    const deleted = await createEquipment(null, { deleted_at: new Date() });

    const response = await api()
      .delete(`/api/equipment/${deleted.id}`)
      .set(as(await admin()));

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('EQUIPMENT NOT FOUND');
  });
});

describe('POST /api/equipment/category', () => {
  it('creates the category and returns it', async () => {
    const response = await api()
      .post('/api/equipment/category')
      .set(as(await admin()))
      .send({ name: 'Mounts' });

    expect(response.status).toBe(200);
    const [row] = await equipmentCategoryRows();
    expect(response.body).toEqual({
      id: row.id,
      name: 'Mounts',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      deletedAt: null,
    });
  });
});

describe('PATCH /api/equipment/category', () => {
  it('renames the category and answers the changed row count', async () => {
    const category = await createEquipmentCategory();

    const response = await api()
      .patch('/api/equipment/category')
      .set(as(await admin()))
      .send({ id: category.id, name: 'Mounts' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([1]);
    expect((await equipmentCategoryRows())[0].name).toBe('Mounts');
  });

  it('refuses a member below the admin grade', async () => {
    const category = await createEquipmentCategory();

    const response = await api()
      .patch('/api/equipment/category')
      .set(as(await createUser({ grade: 7 })))
      .send({ id: category.id, name: 'Mounts' });

    expect(response.status).toBe(403);
    expect(response.body).toEqual(FORBIDDEN);
  });
});

describe('DELETE /api/equipment/category/:categoryId', () => {
  it('soft-deletes an empty category, ignoring deleted equipment', async () => {
    const category = await createEquipmentCategory();
    await createEquipment(category, { deleted_at: new Date() });

    const response = await api()
      .delete(`/api/equipment/category/${category.id}`)
      .set(as(await admin()));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, id: category.id });
    expect((await equipmentCategoryRows())[0].deleted_at).not.toBeNull();
  });

  it('answers 409 while the category has equipment', async () => {
    const category = await createEquipmentCategory();
    await createEquipment(category);

    const response = await api()
      .delete(`/api/equipment/category/${category.id}`)
      .set(as(await admin()));

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      success: false,
      error: 'CONFLICT',
      message: 'EQUIPMENT EXISTS IN CATEGORY',
    });
    expect((await equipmentCategoryRows())[0].deleted_at).toBeNull();
  });

  it('refuses a member below the admin grade', async () => {
    const category = await createEquipmentCategory();

    const response = await api()
      .delete(`/api/equipment/category/${category.id}`)
      .set(as(await createUser({ grade: 7 })));

    expect(response.status).toBe(403);
    expect((await equipmentCategoryRows())[0].deleted_at).toBeNull();
  });
});

describe('equipment after the move', () => {
  it('answers 404 instead of 500 for a non-numeric or missing id', async () => {
    const manager = await admin();
    const category = await createEquipmentCategory();

    const responses = await Promise.all([
      api().delete('/api/equipment/abc').set(as(manager)),
      api().delete('/api/equipment/category/abc').set(as(manager)),
      api().delete('/api/equipment/category/999999').set(as(manager)),
      api()
        .patch('/api/equipment/category')
        .set(as(manager))
        .send({ id: 999999, name: 'Mounts' }),
    ]);

    expect(responses.map((response) => response.status)).toEqual([
      404, 404, 404, 404,
    ]);
    expect((await equipmentCategoryRows())[0].deleted_at).toBeNull();
    expect(category).toBeDefined();
  });

  it('answers 400 instead of 500 for a body or query the web never sends', async () => {
    const manager = await admin();
    const category = await createEquipmentCategory();

    const responses = await Promise.all([
      api()
        .patch('/api/equipment/')
        .set(as(manager))
        .send(formBody(category.id)),
      api().post('/api/equipment/category').set(as(manager)).send({}),
      api()
        .patch('/api/equipment/category')
        .set(as(manager))
        .send({ name: 'Mounts' }),
      api()
        .get('/api/equipment/search')
        .query({ category_id: 'abc' })
        .set(as(manager)),
    ]);

    expect(responses.map((response) => response.status)).toEqual([
      400, 400, 400, 400,
    ]);
    expect(await equipmentCategoryRows()).toHaveLength(1);
  });

  it('keeps the rent status when a change leaves out the status', async () => {
    const renter = await createUser({ grade: 7 });
    const equipment = await createEquipment(null, { rent_status: 'RENTED' });
    await createRent(renter, equipment);

    const response = await api()
      .patch('/api/equipment/')
      .set(as(await admin()))
      .send({ id: equipment.id, name: 'Renamed' });

    expect(response.status).toBe(200);
    expect(await equipmentRow(equipment.id)).toMatchObject({
      name: 'Renamed',
      status: 'OK',
      rent_status: 'RENTED',
    });
  });
});
