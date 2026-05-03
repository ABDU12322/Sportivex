import process from 'node:process';
import { defineConfig } from 'vitest/config';

process.env.NODE_ENV = 'test';

export default defineConfig({
  test: {
    include: ['tests/integration/**/*.test.js'],
    environment: 'node',
    globals: true,
    setupFiles: ['dotenv/config']
  }
});
