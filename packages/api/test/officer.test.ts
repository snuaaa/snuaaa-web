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
  { role: '부회장', names: ['박현우'] },
  { role: '관측부장', names: ['김민성', '김민주'] },
];
const BODY = { president: '김성윤', roles: ROLES };

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
    await createOfficerGeneration(93, BODY);
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
      president: '김성윤',
      roles: ROLES,
      updated_at: expect.any(String),
    });
  });

  it('is open to every grade, guests (10) included', async () => {
    await createOfficerGeneration(93);
    for (const grade of [9, 10]) {
      expect(await listGenerations(grade)).toHaveLength(1);
    }
  });
});

describe('PUT /api/officers/:generation', () => {
  it('lets 운영진 (3) add a generation', async () => {
    const officer = await createUser({ grade: 3 });

    const response = await api()
      .put('/api/officers/94')
      .set('Authorization', bearer(officer))
      .send(BODY);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      generation: {
        generation: 94,
        president: '김성윤',
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
      .send(BODY);

    expect(response.status).toBe(200);
    const generations = await listGenerations();
    expect(generations).toHaveLength(1);
    expect(generations[0]).toMatchObject(BODY);
  });

  it('trims names and roles', async () => {
    const officer = await createUser({ grade: 3 });

    await api()
      .put('/api/officers/94')
      .set('Authorization', bearer(officer))
      .send({
        president: ' 김성윤 ',
        roles: [{ role: ' 관측부장 ', names: [' 김민성'] }],
      });

    expect((await listGenerations())[0]).toMatchObject({
      president: '김성윤',
      roles: [{ role: '관측부장', names: ['김민성'] }],
    });
  });

  it('saves a generation with only its 회장', async () => {
    const officer = await createUser({ grade: 3 });

    const response = await api()
      .put('/api/officers/94')
      .set('Authorization', bearer(officer))
      .send({ president: '김성윤' });

    expect(response.status).toBe(200);
    expect(response.body.generation).toMatchObject({
      president: '김성윤',
      roles: [],
    });
  });

  it('is closed to 전 회장 (4), 임원진 (6) and members', async () => {
    await createOfficerGeneration(93);
    for (const grade of [4, 6, 7]) {
      const member = await createUser({ grade });
      const response = await api()
        .put('/api/officers/93')
        .set('Authorization', bearer(member))
        .send(BODY);
      expect(response.status).toBe(403);
      expect(response.body).toEqual(FORBIDDEN);
    }
    expect((await listGenerations())[0].president).toBe('회장93');
  });

  it('lets 운영진 change a past generation', async () => {
    await createOfficerGeneration(92);
    await createOfficerGeneration(93);
    const manager = await createUser({ grade: 3 });

    const response = await api()
      .put('/api/officers/92')
      .set('Authorization', bearer(manager))
      .send(BODY);

    expect(response.status).toBe(200);
  });

  it('lets 현 회장 (5) change the current generation or add the next', async () => {
    await createOfficerGeneration(92);
    await createOfficerGeneration(93);
    const president = await createUser({ grade: 5 });

    for (const generation of [93, 94]) {
      const response = await api()
        .put(`/api/officers/${generation}`)
        .set('Authorization', bearer(president))
        .send(BODY);
      expect(response.status).toBe(200);
    }
    const generations = await listGenerations();
    expect(
      generations.map((g: { generation: number }) => g.generation),
    ).toEqual([94, 93, 92]);
  });

  it('keeps 현 회장 off past and skipped generations', async () => {
    await createOfficerGeneration(92);
    await createOfficerGeneration(93);
    const president = await createUser({ grade: 5 });

    for (const generation of [92, 95]) {
      const response = await api()
        .put(`/api/officers/${generation}`)
        .set('Authorization', bearer(president))
        .send(BODY);
      expect(response.status).toBe(403);
      expect(response.body).toEqual(FORBIDDEN);
    }
    expect(await listGenerations()).toHaveLength(2);
  });

  it('rejects a bad generation or body with 400', async () => {
    const officer = await createUser({ grade: 3 });
    const cases: [string, unknown][] = [
      ['0', BODY],
      ['abc', BODY],
      ['1.5', BODY],
      ['94', {}],
      ['94', { roles: ROLES }],
      ['94', { president: '  ', roles: ROLES }],
      ['94', { president: '김성윤', roles: [{ role: '총무', names: [] }] }],
      ['94', { president: '김성윤', roles: [{ role: '', names: ['박현우'] }] }],
      ['94', { president: '김성윤', roles: [{ role: '총무', names: ['  '] }] }],
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
  it('lets 운영진 delete a generation', async () => {
    await createOfficerGeneration(92);
    await createOfficerGeneration(93);
    const officer = await createUser({ grade: 3 });

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
    const officer = await createUser({ grade: 1 });

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

  it('is closed below 운영진, 현 회장 included', async () => {
    await createOfficerGeneration(93);
    for (const grade of [5, 6]) {
      const member = await createUser({ grade });
      const response = await api()
        .delete('/api/officers/93')
        .set('Authorization', bearer(member));
      expect(response.status).toBe(403);
    }
    expect(await listGenerations()).toHaveLength(1);
  });
});
