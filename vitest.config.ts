import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['server/test/**/*.{test,spec}.ts'],
    globals: true,
    environment: 'node',
  },
});


