// force timezone to UTC to allow tests to work regardless of local timezone
// generally used by snapshots, but can affect specific tests
process.env.TZ = 'UTC';
const originalConfig = require('./.config/jest.config');

module.exports = {
  // Jest configuration provided by Grafana scaffolding
  ...originalConfig,
  transformIgnorePatterns: originalConfig.transformIgnorePatterns.map((pattern) => (pattern.startsWith('node_modules') ? `../../${pattern}` : pattern)),
  moduleNameMapper: {
    ...originalConfig.moduleNameMapper,
    '^@/components/(.*)': '<rootDir>/src/components/$1',
    '^@/editors/(.*)': '<rootDir>/src/editors/$1',
    '^@/utils/(.*)': '<rootDir>/src/utils/$1',
    '^@/app/(.*)': '<rootDir>/src/app/$1',
    '^@/types/(.*)': '<rootDir>/src/types/$1',
    '^@/constants': '<rootDir>/src/constants.ts',
    '^@/variables': '<rootDir>/src/variables.ts',
    '^@/datasource': '<rootDir>/src/datasource.ts',
    '^@/interpolate': '<rootDir>/src/interpolate.ts',
    '^@/migrate': '<rootDir>/src/migrate.ts',
    '^@/selectors': '<rootDir>/src/selectors.ts',
  },
};
