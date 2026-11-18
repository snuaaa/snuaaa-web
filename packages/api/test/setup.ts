import { afterAll, beforeEach } from 'vitest';
import { s3Mock, sesMock } from './helpers/aws';
import { resetDb } from './helpers/db';
import { pool } from './helpers/sql';

beforeEach(async () => {
  s3Mock.reset();
  sesMock.reset();
  await resetDb();
});

afterAll(async () => {
  await pool.end();
});
