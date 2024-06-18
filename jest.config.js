const { grafanaESModules, nodeModulesToTransform } = require('./.config/jest/utils');

// force timezone to UTC to allow tests to work regardless of local timezone
// generally used by snapshots, but can affect specific tests
process.env.TZ = 'UTC';
const originalConfig = require('./.config/jest.config');

module.exports = {
  // Jest configuration provided by Grafana scaffolding
  ...originalConfig,
  transformIgnorePatterns: originalConfig.transformIgnorePatterns.map((pattern) => (pattern.startsWith('node_modules') ? `../../${pattern}` : pattern)),
};
