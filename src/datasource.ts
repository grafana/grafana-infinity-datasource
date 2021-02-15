import flatten from 'lodash/flatten';
import { DataSourceApi, DataQueryResponse, DataQueryRequest } from '@grafana/data';
import { InfinityProvider } from './app/InfinityProvider';
import { SeriesProvider } from './app/SeriesProvider';
import { replaceVariables } from './app/InfinityQuery';
import { LegacyVariableProvider, InfinityVariableProvider } from './app/variablesQuery';
import {
  InfinityQuery,
  GlobalInfinityQuery,
  VariableQuery,
  MetricFindValue,
  HealthCheckResult,
  HealthCheckResultStatus,
  InfinityInstanceSettings,
} from './types';

export class Datasource extends DataSourceApi<InfinityQuery> {
  instanceSettings: InfinityInstanceSettings;
  constructor(iSettings: InfinityInstanceSettings) {
    super(iSettings);
    this.instanceSettings = iSettings;
  }
  testDatasource(): Promise<HealthCheckResult> {
    return new Promise((resolve, reject) => {
      if (
        this.instanceSettings.jsonData &&
        this.instanceSettings.jsonData.datasource_mode &&
        this.instanceSettings.jsonData.datasource_mode === 'basic'
      ) {
        resolve({ message: 'No checks required', status: HealthCheckResultStatus.Success });
      } else {
        if (this.instanceSettings.url) {
          resolve({ message: 'No checks performed', status: HealthCheckResultStatus.Success });
        } else {
          reject({ message: 'Missing URL', status: HealthCheckResultStatus.Failure });
        }
      }
    });
  }
  query(options: DataQueryRequest<InfinityQuery>): Promise<DataQueryResponse> {
    const promises: any[] = [];
    options.targets
      .filter((t: InfinityQuery) => t.hide !== true)
      .forEach((t: InfinityQuery) => {
        if (
          t.type === 'global' &&
          t.global_query_id &&
          this.instanceSettings.jsonData.global_queries &&
          this.instanceSettings.jsonData.global_queries.length > 0
        ) {
          let matchingQuery = this.instanceSettings.jsonData.global_queries.find(
            (q: GlobalInfinityQuery) => q.id === t.global_query_id
          );
          t = matchingQuery ? matchingQuery.query : t;
        }
        promises.push(
          new Promise((resolve, reject) => {
            switch (t.type) {
              case 'csv':
              case 'html':
              case 'json':
              case 'xml':
              case 'graphql':
                new InfinityProvider(replaceVariables(t, options.scopedVars), this.instanceSettings)
                  .query()
                  .then(res => resolve(res))
                  .catch(ex => {
                    reject(ex);
                  });
                break;
              case 'series':
                new SeriesProvider(replaceVariables(t, options.scopedVars))
                  .query(new Date(options.range.from.toDate()).getTime(), new Date(options.range.to.toDate()).getTime())
                  .then(res => resolve(res))
                  .catch(ex => {
                    reject(ex);
                  });
                break;
              case 'global':
                reject('Query not found');
                break;
              default:
                reject('Unknown Query Type');
                break;
            }
          })
        );
      });
    return Promise.all(promises).then(results => {
      return { data: flatten(results) };
    });
  }
  metricFindQuery(query: VariableQuery): Promise<MetricFindValue[]> {
    const promises: any[] = [];
    switch (query.queryType) {
      case 'infinity':
        if (query.infinityQuery) {
          const infinityVariableProvider = new InfinityVariableProvider(query.infinityQuery, this.instanceSettings);
          promises.push(infinityVariableProvider.query());
        }
        break;
      case 'legacy':
      default:
        const legacyVariableProvider = new LegacyVariableProvider(typeof query === 'string' ? query : query.query);
        promises.push(legacyVariableProvider.query());
        break;
    }
    return Promise.all(promises).then(results => {
      return flatten(results);
    });
  }
}
