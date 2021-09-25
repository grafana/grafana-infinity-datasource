import { DataSourceInstanceSettings, MetricFindValue } from '@grafana/data';
import { DataSourceWithBackend } from '@grafana/runtime';
import { InfinityConfig, InfinityQuery, InfinityVariableQuery } from './types';

export class InfinityDatasource extends DataSourceWithBackend<InfinityQuery, InfinityConfig> {
  constructor(instanceSettings: DataSourceInstanceSettings<InfinityConfig>) {
    super(instanceSettings);
  }
  metricFindQuery(query: InfinityVariableQuery): Promise<MetricFindValue[]> {
    return new Promise((resolve) => {
      resolve([]);
    });
  }
}
