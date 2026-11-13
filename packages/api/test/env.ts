/**
 * Environment for the API tests.
 *
 * Tests truncate every table, so they never read `POSTGRESQL_*` from the
 * shell or `.env`. They use their own `TEST_*` variables, and the database
 * name must end with `_test`.
 */
export const testEnv = {
  NODE_ENV: 'test',
  POSTGRESQL_DATABASE: process.env.TEST_POSTGRESQL_DATABASE ?? 'snuaaa_test',
  POSTGRESQL_USERNAME: process.env.TEST_POSTGRESQL_USERNAME ?? 'postgres',
  POSTGRESQL_PASSWORD: process.env.TEST_POSTGRESQL_PASSWORD ?? 'postgres',
  DB_HOST: process.env.TEST_DB_HOST ?? 'localhost',
  JWT_SECRET: 'test-jwt-secret',
  AWS_REGION: 'ap-northeast-2',
  AWS_ACCESS_KEY_ID: 'test',
  AWS_SECRET_ACCESS_KEY: 'test',
  S3_BUCKET_NAME: 'snuaaa-test',
  SENTRY_DSN: '',
};

if (!testEnv.POSTGRESQL_DATABASE.endsWith('_test')) {
  throw new Error(
    `Refusing to run tests on "${testEnv.POSTGRESQL_DATABASE}": ` +
      'the test database name must end with "_test".',
  );
}
