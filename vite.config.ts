import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['./src/app/**/*.{test,spec}.ts'],
    exclude: ['./src/app/variablesQuery/index.test.ts', './src/app/variablesQuery/VariableQuery.spec.ts'],
    resolveSnapshotPath: (testPath, snapExtension) => testPath + '.vitest' + snapExtension,
  },
});
