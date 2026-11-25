import { describe, expect, it } from 'vitest';
import { api } from './helpers/request';
import {
  bearer,
  createOfficerGeneration,
  createUser,
} from './helpers/factories';
import { gradeOf } from './helpers/db';

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
      president_uuid: null,
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
    expect(await listGenerations()).toEqual([
      { ...response.body.generation, president_uuid: null },
    ]);
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

  it('lets 현 회장 (5) change their own generation, the newest', async () => {
    const president = await createUser({ grade: 5 });
    await createOfficerGeneration(92);
    await createOfficerGeneration(93, { presidentUserId: president.user_id });

    const response = await api()
      .put('/api/officers/93')
      .set('Authorization', bearer(president))
      .send(BODY);

    expect(response.status).toBe(200);
    expect((await listGenerations())[0]).toMatchObject({
      generation: 93,
      ...BODY,
    });
  });

  it('matches the 회장 of an imported generation by name', async () => {
    await createOfficerGeneration(93, { president: '김성윤' });
    const president = await createUser({ grade: 5, username: '김성윤' });
    const other = await createUser({ grade: 5, username: '박시원' });

    const own = await api()
      .put('/api/officers/93')
      .set('Authorization', bearer(president))
      .send(BODY);
    const notOwn = await api()
      .put('/api/officers/93')
      .set('Authorization', bearer(other))
      .send(BODY);

    expect(own.status).toBe(200);
    expect(notOwn.status).toBe(403);
  });

  it('keeps another grade 5 member off the newest generation', async () => {
    const president = await createUser({ grade: 5, username: '김성윤' });
    await createOfficerGeneration(93, {
      president: '김성윤',
      presidentUserId: president.user_id,
    });
    // Same name, other account: the account decides.
    const namesake = await createUser({ grade: 5, username: '김성윤' });

    const response = await api()
      .put('/api/officers/93')
      .set('Authorization', bearer(namesake))
      .send(BODY);

    expect(response.status).toBe(403);
    expect(response.body).toEqual(FORBIDDEN);
  });

  it('uses the grade in the DB, not the one in the token', async () => {
    const former = await createUser({ grade: 4 });
    await createOfficerGeneration(93, { presidentUserId: former.user_id });

    const response = await api()
      .put('/api/officers/93')
      .set('Authorization', bearer({ ...former, grade: 5 }))
      .send(BODY);

    expect(response.status).toBe(403);
  });

  it('keeps 현 회장 off past and new generations', async () => {
    const president = await createUser({ grade: 5 });
    await createOfficerGeneration(92, { presidentUserId: president.user_id });
    await createOfficerGeneration(93, { presidentUserId: president.user_id });

    for (const generation of [92, 94, 95]) {
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

describe('POST /api/officers/handover', () => {
  async function setUp() {
    const president = await createUser({ grade: 5, username: '김성윤' });
    await createOfficerGeneration(93, {
      president: '김성윤',
      presidentUserId: president.user_id,
      roles: ROLES,
    });
    const next = await createUser({ grade: 6, username: '홍길동' });
    return { president, next };
  }

  it('lets 현 회장 hand over to the next 회장', async () => {
    const { president, next } = await setUp();

    const response = await api()
      .post('/api/officers/handover')
      .set('Authorization', bearer(president))
      .send({ president_uuid: next.user_uuid });

    expect(response.status).toBe(200);
    expect(response.body.generation).toMatchObject({
      generation: 94,
      president: '홍길동',
      roles: [],
    });
    expect(await gradeOf(president)).toBe(4);
    expect(await gradeOf(next)).toBe(5);
    expect((await listGenerations())[0]).toMatchObject({
      generation: 94,
      president_uuid: next.user_uuid,
    });
  });

  it('gives the new 회장 their own 기수 and the old one none', async () => {
    const { president, next } = await setUp();
    await api()
      .post('/api/officers/handover')
      .set('Authorization', bearer(president))
      .send({ president_uuid: next.user_uuid });

    const own = await api()
      .put('/api/officers/94')
      .set('Authorization', bearer(next))
      .send({ president: '홍길동', roles: ROLES });
    // The old token still says grade 5.
    const old = await api()
      .put('/api/officers/93')
      .set('Authorization', bearer(president))
      .send(BODY);

    expect(own.status).toBe(200);
    expect(old.status).toBe(403);
  });

  it('lets 운영진 hand over, and keeps a 운영진 회장 at their grade', async () => {
    const { president } = await setUp();
    const manager = await createUser({ grade: 3 });
    const next = await createUser({ grade: 3, username: '이운영' });

    const response = await api()
      .post('/api/officers/handover')
      .set('Authorization', bearer(manager))
      .send({ president_uuid: next.user_uuid });

    expect(response.status).toBe(200);
    expect(await gradeOf(president)).toBe(4);
    expect(await gradeOf(next)).toBe(3);
  });

  it('is closed to everyone else', async () => {
    const { next } = await setUp();
    // 4 is 전 회장, and a grade 5 member who is not this 기수's 회장.
    for (const grade of [4, 5, 6, 7]) {
      const member = await createUser({ grade });
      const response = await api()
        .post('/api/officers/handover')
        .set('Authorization', bearer(member))
        .send({ president_uuid: next.user_uuid });
      expect(response.status).toBe(403);
      expect(response.body).toEqual(FORBIDDEN);
    }
    expect(await listGenerations()).toHaveLength(1);
    expect(await gradeOf(next)).toBe(6);
  });

  it('answers 404 for an unknown member, and changes nothing', async () => {
    const { president } = await setUp();

    const response = await api()
      .post('/api/officers/handover')
      .set('Authorization', bearer(president))
      .send({ president_uuid: '00000000-0000-4000-8000-000000000000' });

    expect(response.status).toBe(404);
    expect(await gradeOf(president)).toBe(5);
    expect(await listGenerations()).toHaveLength(1);
  });

  it('rejects a member without a name, or a bad body, with 400', async () => {
    const { president } = await setUp();
    const nameless = await createUser({ grade: 7, username: null });

    for (const body of [{ president_uuid: nameless.user_uuid }, {}]) {
      const response = await api()
        .post('/api/officers/handover')
        .set('Authorization', bearer(president))
        .send(body);
      expect(response.status).toBe(400);
    }
    expect(await gradeOf(president)).toBe(5);
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
