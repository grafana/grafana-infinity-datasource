const { grafanaESModules, nodeModulesToTransform } = require('./.config/jest/utils');

// force timezone to UTC to allow tests to work regardless of local timezone
// generally used by snapshots, but can affect specific tests
process.env.TZ = 'UTC';

module.exports = {
  // Jest configuration provided by Grafana scaffolding
  ...require('./.config/jest.config'),
  transformIgnorePatterns: [nodeModulesToTransform([...grafanaESModules, 'rxjs', 'jsonpath-plus'])],
};
