const standard = require('@grafana/toolkit/src/config/jest.plugin.config');
const globals = standard.jestConfig().globals;
const tsJest = globals['ts-jest'];

module.exports = {
  ...{
    ...standard.jestConfig(),
    setupFilesAfterEnv: ['<rootDir>/src/tests.ts'],
    modulePathIgnorePatterns: [
      '<rootDir>/src/module.ts',
      '<rootDir>/src/selectors.ts',
      '<rootDir>/src/styles.ts',
      '<rootDir>/src/types.ts',
    ],
    globals: {
      ...globals,
      'ts-jest': {
        isolatedModules: tsJest.isolatedModules,
        tsconfig: tsJest.tsConfig,
      },
    },
  },
};
