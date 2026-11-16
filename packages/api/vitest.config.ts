import { defineConfig } from 'vitest/config';
import { testEnv } from './test/env';

// Set before anything loads `dotenv/config`, which does not override
// variables that are already set. Test workers inherit it too.
Object.assign(process.env, testEnv);

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    env: testEnv,
    globalSetup: ['test/globalSetup.ts'],
    setupFiles: ['test/setup.ts'],
    // Every test file shares one database and truncates it between tests.
    fileParallelism: false,
    // Show console output (e.g. the error handler's 4xx warnings) only for failing tests.
    silent: 'passed-only',
  },
});
