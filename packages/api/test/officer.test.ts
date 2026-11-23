import { describe, expect, it } from 'vitest';
import { api } from './helpers/request';
import {
  bearer,
  createOfficerGeneration,
  createUser,
} from './helpers/factories';

const FORBIDDEN = {
  success: false,
  error: 'FORBIDDEN',
  message: 'Permission denied',
  code: 4001,
};

const ROLES = [
  { role: '회장', names: ['김성윤'] },
  { role: '관측부장', names: ['김민성', '김민주'] },
];

async function listGenerations(grade = 8) {
  const member = await createUser({ grade });
  const response = await api()
    .get('/api/officers')
    .set('Authorization', bearer(member));
  return response.body.generations;
}

describe('GET /api/officers', () => {
  it('lists every generation newest first, roles in order', async () => {
    await createOfficerGeneration(91);
    await createOfficerGeneration(93, ROLES);
    await createOfficerGeneration(92);
    const member = await createUser({ grade: 8 });

    const response = await api()
      .get('/api/officers')
      .set('Authorization', bearer(member));

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(
      response.body.generations.map(
        (g: { generation: number }) => g.generation,
      ),
    ).toEqual([93, 92, 91]);
    expect(response.body.generations[0]).toEqual({
      generation: 93,
      roles: ROLES,
      updated_at: expect.any(String),
    });
  });

  it('is closed to 비회원 (9) and guests (10)', async () => {
    await createOfficerGeneration(93);
    for (const grade of [9, 10]) {
      const user = await createUser({ grade });
      const response = await api()
        .get('/api/officers')
        .set('Authorization', bearer(user));
      expect(response.status).toBe(403);
      expect(response.body).toEqual(FORBIDDEN);
    }
  });
});

describe('PUT /api/officers/:generation', () => {
  it('lets 임원진 (6) add a generation', async () => {
    const officer = await createUser({ grade: 6 });

    const response = await api()
      .put('/api/officers/94')
      .set('Authorization', bearer(officer))
      .send({ roles: ROLES });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      generation: {
        generation: 94,
        roles: ROLES,
        updated_at: expect.any(String),
      },
    });
    expect(await listGenerations()).toEqual([response.body.generation]);
  });

  it('replaces the roles of an existing generation', async () => {
    await createOfficerGeneration(93);
    const officer = await createUser({ grade: 1 });

    const response = await api()
      .put('/api/officers/93')
      .set('Authorization', bearer(officer))
      .send({ roles: ROLES });

    expect(response.status).toBe(200);
    const generations = await listGenerations();
    expect(generations).toHaveLength(1);
    expect(generations[0].roles).toEqual(ROLES);
  });

  it('trims names and roles', async () => {
    const officer = await createUser({ grade: 6 });

    await api()
      .put('/api/officers/94')
      .set('Authorization', bearer(officer))
      .send({ roles: [{ role: ' 회장 ', names: [' 김성윤'] }] });

    expect((await listGenerations())[0].roles).toEqual([
      { role: '회장', names: ['김성윤'] },
    ]);
  });

  it('is closed to members below 임원진', async () => {
    await createOfficerGeneration(93);
    const member = await createUser({ grade: 7 });

    const response = await api()
      .put('/api/officers/93')
      .set('Authorization', bearer(member))
      .send({ roles: ROLES });

    expect(response.status).toBe(403);
    expect(response.body).toEqual(FORBIDDEN);
    expect((await listGenerations())[0].roles).not.toEqual(ROLES);
  });

  it('rejects a bad generation or body with 400', async () => {
    const officer = await createUser({ grade: 6 });
    const cases: [string, unknown][] = [
      ['0', { roles: ROLES }],
      ['abc', { roles: ROLES }],
      ['1.5', { roles: ROLES }],
      ['94', {}],
      ['94', { roles: [] }],
      ['94', { roles: [{ role: '회장', names: [] }] }],
      ['94', { roles: [{ role: '', names: ['김성윤'] }] }],
      ['94', { roles: [{ role: '회장', names: ['  '] }] }],
    ];
    for (const [generation, body] of cases) {
      const response = await api()
        .put(`/api/officers/${generation}`)
        .set('Authorization', bearer(officer))
        .send(body as object);
      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        success: false,
        error: 'BAD_REQUEST',
      });
    }
    expect(await listGenerations()).toEqual([]);
  });
});

describe('DELETE /api/officers/:generation', () => {
  it('lets 임원진 delete a generation', async () => {
    await createOfficerGeneration(92);
    await createOfficerGeneration(93);
    const officer = await createUser({ grade: 6 });

    const response = await api()
      .delete('/api/officers/93')
      .set('Authorization', bearer(officer));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
    expect(
      (await listGenerations()).map(
        (g: { generation: number }) => g.generation,
      ),
    ).toEqual([92]);
  });

  it('answers 404 for a generation that does not exist', async () => {
    const officer = await createUser({ grade: 6 });

    const response = await api()
      .delete('/api/officers/93')
      .set('Authorization', bearer(officer));

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      error: 'NOT_FOUND',
      message: 'Officer generation not found',
    });
  });

  it('is closed to members below 임원진', async () => {
    await createOfficerGeneration(93);
    const member = await createUser({ grade: 7 });

    const response = await api()
      .delete('/api/officers/93')
      .set('Authorization', bearer(member));

    expect(response.status).toBe(403);
    expect(await listGenerations()).toHaveLength(1);
  });
});
