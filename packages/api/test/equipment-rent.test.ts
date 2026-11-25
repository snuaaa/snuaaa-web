import { describe, expect, it } from 'vitest';
import { api } from './helpers/request';
import {
  bearer,
  createEquipment,
  createRent,
  createRentReturn,
  createUser,
  type Equipment,
  type User,
} from './helpers/factories';
import {
  equipmentRow,
  penaltyStatusOf,
  rentsOf,
  softDeleteUser,
  withFailingWrites,
  withRowsLocked,
} from './helpers/db';

/*
 * Renting and returning equipment, and the rent records admins read, with
 * the requests the web sends (`EquipmentService`).
 */

const DAY = 24 * 60 * 60 * 1000;

const FORBIDDEN = {
  success: false,
  error: 'FORBIDDEN',
  message: 'PERMISSION DENIED',
};

const member = () => createUser({ grade: 7 });
const admin = () => createUser({ grade: 6 });

function as(user: User) {
  return { Authorization: bearer(user) };
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

function rent(user: User, equipmentIds: unknown[]) {
  return api()
    .post('/api/equipment/rent/')
    .set(as(user))
    .send({ equipmentIds });
}

function returnRent(user: User, rentId: number | string, photo_path = 'p.jpg') {
  return api()
    .post(`/api/equipment/rent/${rentId}/return`)
    .set(as(user))
    .send({ photo_path });
}

describe('POST /api/equipment/rent', () => {
  it('rents each rentable equipment for two days and reports the rest as failed', async () => {
    const renter = await member();
    const free = await createEquipment(null);
    const taken = await createEquipment(null, { rent_status: 'RENTED' });
    const broken = await createEquipment(null, {
      status: 'BROKEN',
      rent_status: 'UNRENTABLE',
    });
    const deleted = await createEquipment(null, { deleted_at: new Date() });

    const response = await rent(renter, [
      free.id,
      taken.id,
      broken.id,
      deleted.id,
      999999,
    ]);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      successEquipmentIds: [free.id],
      failedEquipmentIds: [taken.id, broken.id, deleted.id, 999999],
    });
    const [row] = await rentsOf(free.id);
    expect(row).toMatchObject({ user_id: renter.user_id, returned: false });
    expect(row.end_date!.getTime() - row.start_date.getTime()).toBe(2 * DAY);
    expect((await equipmentRow(free.id)).rent_status).toBe('RENTED');
    expect(await rentsOf(taken.id)).toEqual([]);
  });

  it('answers 400 when equipmentIds is not an array', async () => {
    const response = await api()
      .post('/api/equipment/rent')
      .set(as(await member()))
      .send({ equipmentIds: 1 });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('BAD_REQUEST');
  });

  it('refuses a member below the rent grade', async () => {
    const equipment = await createEquipment(null);

    const response = await rent(await createUser({ grade: 8 }), [equipment.id]);

    expect(response.status).toBe(403);
    expect(response.body).toEqual(FORBIDDEN);
    expect(await rentsOf(equipment.id)).toEqual([]);
  });
});

describe('POST /api/equipment/rent/:rentId/return', () => {
  it('returns the rent on time, with the photo, and makes the equipment rentable', async () => {
    const renter = await member();
    const equipment = await createEquipment(null, { rent_status: 'RENTED' });
    const rentId = await createRent(renter, equipment);

    const response = await returnRent(renter, rentId, 'returned.jpg');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ result: 'success', id: rentId });
    expect((await rentsOf(equipment.id))[0]).toMatchObject({
      returned: true,
      photo_path: 'returned.jpg',
      return_date: expect.any(Date),
      penalty_status: 'NOPENALTY',
    });
    expect((await equipmentRow(equipment.id)).rent_status).toBe('RENTABLE');
  });

  it('marks a late return as needing a penalty payment, and keeps an unrentable equipment unrentable', async () => {
    const renter = await member();
    const equipment = await createEquipment(null, {
      status: 'BROKEN',
      rent_status: 'UNRENTABLE',
    });
    const rentId = await createRent(renter, equipment, {
      start_date: new Date(Date.now() - 3 * DAY),
    });

    await returnRent(renter, rentId);

    expect(await penaltyStatusOf(rentId)).toBe('NEEDPAYMENT');
    expect((await equipmentRow(equipment.id)).rent_status).toBe('UNRENTABLE');
  });

  it("refuses someone else's rent, a returned one and an unknown one", async () => {
    const renter = await member();
    const equipment = await createEquipment(null, { rent_status: 'RENTED' });
    const rentId = await createRent(renter, equipment);
    const returnedId = await createRent(renter, equipment, { returned: true });

    const other = await returnRent(await member(), rentId);
    const again = await returnRent(renter, returnedId);
    const unknown = await returnRent(renter, 999999);

    expect(other.status).toBe(403);
    expect(other.body.message).toBe('User mismatch: not the renter');
    expect(again.status).toBe(409);
    expect(again.body.message).toBe('Already returned');
    expect(unknown.status).toBe(404);
    expect((await rentsOf(equipment.id))[0].returned).toBe(false);
  });
});

describe('GET /api/equipment/rent/me', () => {
  it("returns the actor's open rents with their equipment, without deleted equipment", async () => {
    const renter = await member();
    const equipment = await createEquipment(null, { rent_status: 'RENTED' });
    const deleted = await createEquipment(null, { deleted_at: new Date() });
    const start = new Date('2024-03-01T10:00:00.000Z');
    const rentId = await createRent(renter, equipment, { start_date: start });
    await createRent(renter, equipment, { returned: true });
    await createRent(renter, deleted);
    await createRent(await member(), equipment);

    const response = await api().get('/api/equipment/rent/me').set(as(renter));

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: rentId,
        start_date: '2024-03-01T10:00:00.000Z',
        end_date: '2024-03-03T10:00:00.000Z',
        equipment: equipmentJson(equipment),
      },
    ]);
  });
});

describe('GET /api/equipment/:id/rents', () => {
  it('returns a page of ten of the equipment rents, newest first, with their return and renter', async () => {
    const renter = await member();
    const equipment = await createEquipment(null);
    const ids: number[] = [];
    for (let index = 0; index < 11; index += 1) {
      ids.push(
        await createRent(renter, equipment, {
          start_date: new Date(Date.UTC(2024, 0, index + 1)),
          returned: true,
        }),
      );
    }
    await createRentReturn(ids[10], {
      return_date: new Date('2024-01-12T00:00:00.000Z'),
      penalty_status: 'NOPENALTY',
      photo_path: 'r.jpg',
    });
    await softDeleteUser(renter);
    await createRent(renter, await createEquipment(null));

    const first = await api()
      .get(`/api/equipment/${equipment.id}/rents?page=1`)
      .set(as(await admin()));
    const second = await api()
      .get(`/api/equipment/${equipment.id}/rents?page=2`)
      .set(as(await admin()));

    expect(first.status).toBe(200);
    expect(first.body.count).toBe(11);
    expect(first.body.rows).toHaveLength(10);
    expect(first.body.rows[0]).toEqual({
      id: ids[10],
      start_date: '2024-01-11T00:00:00.000Z',
      end_date: '2024-01-13T00:00:00.000Z',
      rentReturn: {
        rent_id: ids[10],
        photo_path: 'r.jpg',
        return_date: '2024-01-12T00:00:00.000Z',
        penalty_status: 'NOPENALTY',
      },
      user: userJson(renter, { deleted_at: expect.any(String) }),
    });
    expect(first.body.rows[1].rentReturn).toBeNull();
    expect(second.body).toEqual({
      count: 11,
      rows: [expect.objectContaining({ id: ids[0] })],
    });
  });

  it('refuses a member below the admin grade', async () => {
    const equipment = await createEquipment(null);

    const response = await api()
      .get(`/api/equipment/${equipment.id}/rents`)
      .set(as(await member()));

    expect(response.status).toBe(403);
    expect(response.body).toEqual(FORBIDDEN);
  });
});

describe('GET /api/equipment/rent/records', () => {
  it('returns a page of the returned rents, newest first, with their return, renter and equipment', async () => {
    const renter = await member();
    const equipment = await createEquipment(null);
    const older = await createRent(renter, equipment, {
      start_date: new Date('2024-01-01T00:00:00.000Z'),
      returned: true,
    });
    await createRentReturn(older, {
      return_date: new Date('2024-01-05T00:00:00.000Z'),
      penalty_status: 'NEEDPAYMENT',
      photo_path: 'late.jpg',
    });
    const newer = await createRent(renter, equipment, {
      start_date: new Date('2024-02-01T00:00:00.000Z'),
      returned: true,
    });
    await createRentReturn(newer);
    await createRent(renter, equipment);

    const response = await api()
      .get('/api/equipment/rent/records')
      .query({ page: 1 })
      .set(as(await admin()));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      count: 2,
      rows: [
        expect.objectContaining({ id: newer }),
        {
          id: older,
          start_date: '2024-01-01T00:00:00.000Z',
          end_date: '2024-01-03T00:00:00.000Z',
          rentReturn: {
            rent_id: older,
            photo_path: 'late.jpg',
            return_date: '2024-01-05T00:00:00.000Z',
            penalty_status: 'NEEDPAYMENT',
          },
          user: userJson(renter),
          equipment: {
            id: equipment.id,
            name: equipment.name,
            nickname: equipment.nickname,
          },
        },
      ],
    });
  });

  it('filters by penalty status', async () => {
    const renter = await member();
    const equipment = await createEquipment(null);
    const late = await createRent(renter, equipment, { returned: true });
    await createRentReturn(late, { penalty_status: 'NEEDPAYMENT' });
    const onTime = await createRent(renter, equipment, { returned: true });
    await createRentReturn(onTime);

    const response = await api()
      .get('/api/equipment/rent/records')
      .query({ page: 1, penalty_status: 'NEEDPAYMENT' })
      .set(as(await admin()));

    expect(response.body).toEqual({
      count: 1,
      rows: [expect.objectContaining({ id: late })],
    });
  });

  it('answers 400 for a date it cannot read', async () => {
    const response = await api()
      .get('/api/equipment/rent/records')
      .query({ date_to_start: 'nope' })
      .set(as(await admin()));

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('BAD_REQUEST');
  });

  it('refuses a member below the admin grade', async () => {
    const response = await api()
      .get('/api/equipment/rent/records')
      .set(as(await member()));

    expect(response.status).toBe(403);
    expect(response.body).toEqual(FORBIDDEN);
  });
});

describe('PATCH /api/equipment/rent/:rentId/penalty', () => {
  async function returnedRent(penalty_status: string) {
    const rentId = await createRent(
      await member(),
      await createEquipment(null),
      {
        returned: true,
      },
    );
    await createRentReturn(rentId, { penalty_status });
    return rentId;
  }

  function setPenalty(user: User, rentId: number | string, status: string) {
    return api()
      .patch(`/api/equipment/rent/${rentId}/penalty`)
      .set(as(user))
      .send({ penalty_status: status });
  }

  it('marks the penalty as paid and returns the return record', async () => {
    const rentId = await returnedRent('NEEDPAYMENT');

    const response = await setPenalty(await admin(), rentId, 'RECEIVEDPAYMENT');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      rent_id: rentId,
      photo_path: 'https://bucket.example.com/return.jpg',
      return_date: expect.any(String),
      penalty_status: 'RECEIVEDPAYMENT',
    });
    expect(await penaltyStatusOf(rentId)).toBe('RECEIVEDPAYMENT');
  });

  it('refuses a status other than the two payment states, a rent with no penalty, the current status and an unknown rent', async () => {
    const manager = await admin();
    const late = await returnedRent('NEEDPAYMENT');
    const onTime = await returnedRent('NOPENALTY');

    const responses = [
      await setPenalty(manager, late, 'NOPENALTY'),
      await setPenalty(manager, onTime, 'NEEDPAYMENT'),
      await setPenalty(manager, late, 'NEEDPAYMENT'),
      await setPenalty(manager, 999999, 'NEEDPAYMENT'),
      await setPenalty(manager, 'abc', 'NEEDPAYMENT'),
    ];

    expect(responses.map((response) => response.status)).toEqual([
      400, 400, 409, 404, 400,
    ]);
    expect(responses.map((response) => response.body.message)).toEqual([
      'INVALID PENALTY STATUS',
      'Transition only allowed between NEEDPAYMENT and RECEIVEDPAYMENT',
      'Already in the requested status',
      'RentReturn record not found',
      'INVALID RENT ID',
    ]);
    expect(await penaltyStatusOf(late)).toBe('NEEDPAYMENT');
  });

  it('refuses a member below the admin grade', async () => {
    const rentId = await returnedRent('NEEDPAYMENT');

    const response = await setPenalty(
      await member(),
      rentId,
      'RECEIVEDPAYMENT',
    );

    expect(response.status).toBe(403);
    expect(response.body).toEqual(FORBIDDEN);
    expect(await penaltyStatusOf(rentId)).toBe('NEEDPAYMENT');
  });
});

describe('equipment rents after the move', () => {
  it('rents an equipment listed twice only once', async () => {
    const equipment = await createEquipment(null);

    const response = await rent(await member(), [equipment.id, equipment.id]);

    expect(response.body.successEquipmentIds).toEqual([equipment.id]);
    expect(await rentsOf(equipment.id)).toHaveLength(1);
  });

  it('lets only one of two members rent the same equipment at once', async () => {
    const equipment = await createEquipment(null);

    const responses = await Promise.all([
      rent(await member(), [equipment.id]),
      rent(await member(), [equipment.id]),
    ]);

    expect(
      responses.flatMap((response) => response.body.successEquipmentIds),
    ).toEqual([equipment.id]);
    expect(await rentsOf(equipment.id)).toHaveLength(1);
  });

  it('fails an equipment whose row another request keeps locked, instead of waiting forever', async () => {
    const renter = await member();
    const equipment = await createEquipment(null);

    const response = await withRowsLocked(
      'tb_equipment',
      { id: equipment.id },
      () => rent(renter, [equipment.id]),
    );

    expect(response.body.failedEquipmentIds).toEqual([equipment.id]);
    expect(await rentsOf(equipment.id)).toEqual([]);
  });

  it('keeps a rent and its equipment unchanged when the return fails halfway', async () => {
    const renter = await member();
    const equipment = await createEquipment(null, { rent_status: 'RENTED' });
    const rentId = await createRent(renter, equipment);

    const response = await withFailingWrites('tb_rent_return', 'INSERT', () =>
      returnRent(renter, rentId),
    );

    expect(response.status).toBe(500);
    expect((await rentsOf(equipment.id))[0].returned).toBe(false);
    expect((await equipmentRow(equipment.id)).rent_status).toBe('RENTED');
  });

  it('filters by the start and return dates, including the whole last day in Seoul time', async () => {
    const renter = await member();
    const equipment = await createEquipment(null);
    const march = await createRent(renter, equipment, {
      // 2024-03-10 08:00 in Seoul.
      start_date: new Date('2024-03-09T23:00:00.000Z'),
      returned: true,
    });
    await createRentReturn(march, {
      return_date: new Date('2024-03-11T00:00:00.000Z'),
    });
    const april = await createRent(renter, equipment, {
      start_date: new Date('2024-04-01T00:00:00.000Z'),
      returned: true,
    });
    await createRentReturn(april, {
      return_date: new Date('2024-04-02T00:00:00.000Z'),
    });
    const manager = await admin();

    const records = (query: Record<string, string>) =>
      api()
        .get('/api/equipment/rent/records')
        .query({ page: 1, ...query })
        .set(as(manager));

    const responses = await Promise.all([
      records({ date_from_start: '2024-03-10', date_to_start: '2024-03-10' }),
      records({ date_from_start: '2024-03-11' }),
      records({ date_to_return: '2024-03-31' }),
      records({ date_from_return: '2024-04-01' }),
    ]);

    expect(responses.map((response) => response.status)).toEqual([
      200, 200, 200, 200,
    ]);
    expect(
      responses.map((response) =>
        response.body.rows.map((row: { id: number }) => row.id),
      ),
    ).toEqual([[march], [april], [march], [april]]);
  });

  it('answers 404 instead of 500 for a non-numeric rent or equipment id', async () => {
    const renter = await member();

    const responses = await Promise.all([
      returnRent(renter, 'abc'),
      api()
        .get('/api/equipment/abc/rents')
        .set(as(await admin())),
    ]);

    expect(responses.map((response) => response.status)).toEqual([404, 404]);
  });
});
