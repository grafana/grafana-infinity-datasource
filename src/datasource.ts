import { Observable } from 'rxjs';
import flatten from 'lodash/flatten';
import { DataQueryResponse, DataQueryRequest, LoadingState, TimeRange, ScopedVars } from '@grafana/data';
import { DataSourceWithBackend } from '@grafana/runtime';
import { InfinityProvider } from './app/InfinityProvider';
import { UQLProvider, applyUQL } from './app/UQLProvider';
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
  private getUpdatedOptions = (options: DataQueryRequest<InfinityQuery>): DataQueryRequest<InfinityQuery> => {
    return {
      ...options,
      targets: options.targets
        .filter((t: InfinityQuery) => t.hide !== true)
        .map((t) => this.overrideWithGlobalQuery(t))
        .filter((t) => t.type !== 'global')
        .map((t) => replaceVariables(t, options.scopedVars)),
    };
  };
  private resolveData = (options: DataQueryRequest<InfinityQuery>, t: InfinityQuery, range: TimeRange, scopedVars: ScopedVars): Promise<any> => {
    const startTime = new Date(range.from.toDate()).getTime();
    const endTime = new Date(range.to.toDate()).getTime();
    return new Promise((resolve, reject) => {
      switch (t.type) {
        case 'csv':
        case 'tsv':
        case 'html':
        case 'json':
        case 'xml':
        case 'graphql':
          if (t.format === 'as-is' && t.source === 'inline') {
            const data = JSON.parse(t.data || '[]');
            resolve(data);
          }
          if (t.source === 'inline') {
            new InfinityProvider(t, this).formatResults(t.data).then(resolve).catch(reject);
            break;
          }
          new InfinityProvider(t, this).query().then(resolve).catch(reject);
          break;
        case 'uql':
          new UQLProvider(t, this)
            .query()
            .then((res) => applyUQL(t.uql, res, t.format, t.refId))
            .then(resolve)
            .catch(reject);
          break;
        case 'series':
          new SeriesProvider(replaceVariables(t, scopedVars)).query(startTime, endTime).then(resolve).catch(reject);
          break;
        case 'global':
          reject('Query not found');
          break;
        default:
          reject('Unknown Query Type');
          break;
      }
    });
  };
  private getResults(options: DataQueryRequest<InfinityQuery>): Promise<DataQueryResponse> {
    const promises: any[] = [];
    this.getUpdatedOptions(options).targets.forEach((t: InfinityQuery) => {
      promises.push(this.resolveData(options, t, options.range, options.scopedVars));
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
      let request = this.getUpdatedOptions(options);
      this.getResults(request)
        .then((result) => {
          subscriber.next({ ...result, state: LoadingState.Done });
        })
        .catch((error) => {
          subscriber.next({ data: [], error, state: LoadingState.Error });
          subscriber.error(error);
        })
        .finally(() => subscriber.complete());
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
