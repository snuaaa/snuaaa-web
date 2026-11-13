import { afterAll, beforeEach } from 'vitest';
import { sequelize } from '../src/models/sequelize';
import { s3Mock, sesMock } from './helpers/aws';
import { resetDb } from './helpers/db';

beforeEach(async () => {
  s3Mock.reset();
  sesMock.reset();
  await resetDb();
});

afterAll(async () => {
  await sequelize.close();
});
