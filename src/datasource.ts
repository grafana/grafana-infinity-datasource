import flatten from 'lodash/flatten';
import { Observable } from 'rxjs';
import {
  DataSourceInstanceSettings,
  DataQueryRequest,
  DataQueryResponse,
  MetricFindValue,
  LoadingState,
  MutableDataFrame,
} from '@grafana/data';
import { DataSourceWithBackend } from '@grafana/runtime';
import { replaceGlobalQuery, replaceVariables, migrateLegacyVariableQuery } from './app/queryUtils';
import { InfinityConfig, InfinityQuery, InfinityVariableQuery } from './types';

export class InfinityDatasource extends DataSourceWithBackend<InfinityQuery, InfinityConfig> {
  constructor(private instanceSettings: DataSourceInstanceSettings<InfinityConfig>) {
    super(instanceSettings);
  }
  private getResults(options: DataQueryRequest<InfinityQuery>): Promise<DataQueryResponse> {
    const promises: any[] = [];
    options.targets
      .filter((query) => query.hide !== true)
      .map((query) => replaceGlobalQuery(query, this.instanceSettings))
      .map((query) => replaceVariables(query, options.scopedVars))
      .forEach((query) => {
        promises.push(
          new Promise((resolve, reject) => {
            switch (query.type) {
              case 'global':
                resolve('invalid query');
                break;
              case 'csv':
                resolve(new MutableDataFrame({ name: query.refId + ' ' + query.type, fields: [] }));
                break;
              case 'json':
                resolve(new MutableDataFrame({ name: query.refId + ' ' + query.type, fields: [] }));
                break;
              case 'graphql':
                resolve(new MutableDataFrame({ name: query.refId + ' ' + query.type, fields: [] }));
                break;
              case 'html':
                resolve(new MutableDataFrame({ name: query.refId + ' ' + query.type, fields: [] }));
                break;
              case 'xml':
                resolve(new MutableDataFrame({ name: query.refId + ' ' + query.type, fields: [] }));
                break;
              case 'series':
                resolve(new MutableDataFrame({ name: query.refId + ' ' + query.type, fields: [] }));
                break;
              default:
                reject('invalid query');
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
  metricFindQuery(q: InfinityVariableQuery): Promise<MetricFindValue[]> {
    let query = migrateLegacyVariableQuery(q);
    return new Promise((resolve) => {
      switch (query.queryType) {
        case 'legacy':
          resolve([]);
          break;
        case 'infinity':
        default:
          resolve([]);
      }
    });
  }
}
