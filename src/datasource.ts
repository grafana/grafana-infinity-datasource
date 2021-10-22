import { Observable } from 'rxjs';
import flatten from 'lodash/flatten';
import { DataQueryResponse, DataQueryRequest, LoadingState } from '@grafana/data';
import { DataSourceWithBackend } from '@grafana/runtime';
import { InfinityProvider } from './app/InfinityProvider';
import { SeriesProvider } from './app/SeriesProvider';
import { replaceVariables } from './app/queryUtils';
import { LegacyVariableProvider, InfinityVariableProvider, migrateLegacyQuery } from './app/variablesQuery';
import { InfinityQuery, GlobalInfinityQuery, VariableQuery, MetricFindValue, InfinityInstanceSettings, InfinityOptions } from './types';

export class Datasource extends DataSourceWithBackend<InfinityQuery, InfinityOptions> {
  instanceSettings: InfinityInstanceSettings;
  constructor(iSettings: InfinityInstanceSettings) {
    super(iSettings);
    this.instanceSettings = iSettings;
  }
  annotations = {};
  private overrideWithGlobalQuery(t: InfinityQuery): InfinityQuery {
    if (t.type !== 'global') {
      return t;
    } else if (t.global_query_id && this.instanceSettings.jsonData.global_queries && this.instanceSettings.jsonData.global_queries.length > 0) {
      const global_query_id = t.global_query_id;
      let matchingQuery = this.instanceSettings.jsonData.global_queries.find((q: GlobalInfinityQuery) => q.id === global_query_id);
      return matchingQuery && global_query_id ? matchingQuery.query : t;
    }
    return t;
  }
  private getResults(options: DataQueryRequest<InfinityQuery>): Promise<DataQueryResponse> {
    const startTime = new Date(options.range.from.toDate()).getTime();
    const endTime = new Date(options.range.to.toDate()).getTime();
    const promises: any[] = [];
    options.targets
      .filter((t: InfinityQuery) => t.hide !== true)
      .map((t) => this.overrideWithGlobalQuery(t))
      .filter((t) => t.type !== 'global')
      .map((t) => replaceVariables(t, options.scopedVars))
      .forEach((t: InfinityQuery) => {
        promises.push(
          new Promise((resolve, reject) => {
            switch (t.type) {
              case 'csv':
              case 'tsv':
              case 'html':
              case 'json':
              case 'xml':
              case 'graphql':
                new InfinityProvider(t, this).query().then(resolve).catch(reject);
                break;
              case 'series':
                new SeriesProvider(replaceVariables(t, options.scopedVars)).query(startTime, endTime).then(resolve).catch(reject);
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
    return Promise.all(promises)
      .then((results) => {
        return { data: flatten(results) };
      })
      .catch((ex) => {
        throw ex;
      });
  }
  query(options: DataQueryRequest<InfinityQuery>): Observable<DataQueryResponse> {
    return new Observable<DataQueryResponse>((subscriber) => {
      this.getResults(options)
        .then((result) => {
          subscriber.next({ ...result, state: LoadingState.Done });
        })
        .catch((error) => {
          subscriber.next({ data: [], error, state: LoadingState.Error });
          subscriber.error(error);
        })
        .finally(() => {
          subscriber.complete();
        });
    });
  }
  metricFindQuery(originalQuery: VariableQuery): Promise<MetricFindValue[]> {
    return new Promise((resolve) => {
      let query = migrateLegacyQuery(originalQuery);
      switch (query.queryType) {
        case 'infinity':
          if (query.infinityQuery) {
            const infinityVariableProvider = new InfinityVariableProvider(query.infinityQuery, this.instanceSettings, this);
            infinityVariableProvider.query().then((res) => {
              resolve(flatten(res));
            });
          } else {
            resolve([]);
          }
          break;
        case 'legacy':
        default:
          const legacyVariableProvider = new LegacyVariableProvider(query.query);
          legacyVariableProvider.query().then((res) => {
            resolve(flatten(res));
          });
          break;
      }
    });
  }
}
