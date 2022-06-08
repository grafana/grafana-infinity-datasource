import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
    include: ['./src/**/*.{test,spec}.{ts,tsx}'],
    exclude: [],
    setupFiles: ['./src/tests.ts'],
  },
});
