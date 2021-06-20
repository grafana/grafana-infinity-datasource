import { Observable } from 'rxjs';
import flatten from 'lodash/flatten';
import { DataQueryResponse, DataQueryRequest, LoadingState } from '@grafana/data';
import { DataSourceWithBackend } from '@grafana/runtime';
import { InfinityProvider } from './app/InfinityProvider';
import { SeriesProvider } from './app/SeriesProvider';
import { replaceVariables } from './app/queryUtils';
import { LegacyVariableProvider, InfinityVariableProvider, migrateLegacyQuery } from './app/variablesQuery';
import {
  InfinityQuery,
  GlobalInfinityQuery,
  VariableQuery,
  MetricFindValue,
  InfinityInstanceSettings,
  InfinityDataSourceJSONOptions,
} from './types';

export class Datasource extends DataSourceWithBackend<InfinityQuery, InfinityDataSourceJSONOptions> {
  instanceSettings: InfinityInstanceSettings;
  constructor(iSettings: InfinityInstanceSettings) {
    super(iSettings);
    this.instanceSettings = iSettings;
  }
  private overrideWithGlobalQuery(t: InfinityQuery): InfinityQuery {
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
    return t;
  }
  private getResults(options: DataQueryRequest<InfinityQuery>): Promise<DataQueryResponse> {
    const promises: any[] = [];
    options.targets
      .filter((t: InfinityQuery) => t.hide !== true)
      .forEach((t: InfinityQuery) => {
        t = this.overrideWithGlobalQuery(t);
        promises.push(
          new Promise((resolve, reject) => {
            switch (t.type) {
              case 'csv':
              case 'html':
              case 'json':
              case 'xml':
              case 'graphql':
                new InfinityProvider(replaceVariables(t, options.scopedVars), this)
                  .query()
                  .then((res) => resolve(res))
                  .catch((ex) => {
                    reject(ex);
                  });
                break;
              case 'series':
                new SeriesProvider(replaceVariables(t, options.scopedVars))
                  .query(new Date(options.range.from.toDate()).getTime(), new Date(options.range.to.toDate()).getTime())
                  .then((res) => resolve(res))
                  .catch((ex) => {
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
            const infinityVariableProvider = new InfinityVariableProvider(
              query.infinityQuery,
              this.instanceSettings,
              this
            );
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
