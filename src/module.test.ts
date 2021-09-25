import { DataSourceInstanceSettings } from '@grafana/data';
import { InfinityDatasource } from './datasource';
import { InfinityConfig, InfinityVariableQuery } from './types';

describe('InfinityDatasource', () => {
  describe('metricFindQuery', () => {
    it('should resolve empty array when no query found', async () => {
      const ds = new InfinityDatasource({} as DataSourceInstanceSettings<InfinityConfig>);
      const result = await ds.metricFindQuery({} as InfinityVariableQuery);
      expect(result.length).toBe(0);
      expect(result).toStrictEqual([]);
    });
  });
});
