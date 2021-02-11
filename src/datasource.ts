import { flatten, chunk, last, sample } from 'lodash';
import {
  DataSourceApi,
  DataQueryResponse,
  AnnotationQueryRequest,
  AnnotationEvent,
  DataSourceInstanceSettings,
  DataQueryRequest,
} from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { InfinityProvider } from './app/InfinityProvider';
import { SeriesProvider } from './app/SeriesProvider';
import { replaceVariables } from './utils';
import { InfinityDataSourceJSONOptions } from './config.editor';
import { InfinityQuery, GlobalInfinityQuery, VariableQuery, MetricFindValue } from './types';

export class Datasource extends DataSourceApi<InfinityQuery> {
  instanceSettings: DataSourceInstanceSettings<InfinityDataSourceJSONOptions>;
  constructor(iSettings: DataSourceInstanceSettings<InfinityDataSourceJSONOptions>) {
    super(iSettings);
    this.instanceSettings = iSettings;
  }
  testDatasource() {
    return new Promise(async (resolve: any, reject: any) => {
      if (
        this.instanceSettings.jsonData &&
        this.instanceSettings.jsonData.datasource_mode &&
        this.instanceSettings.jsonData.datasource_mode === 'basic'
      ) {
        resolve({ message: 'No checks required', status: 'success' });
      } else {
        if (this.instanceSettings.url) {
          resolve({ message: 'No checks performed', status: 'success' });
        } else {
          reject({ message: 'Missing URL', status: 'error' });
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
  annotationQuery(options: AnnotationQueryRequest<InfinityQuery>): Promise<AnnotationEvent[]> {
    const promises: any[] = [];
    return Promise.all(promises).then(results => {
      return [];
    });
  }
  metricFindQuery(query: VariableQuery): Promise<MetricFindValue[]> {
    const promises: any[] = [];
    switch (query.queryType) {
      case 'legacy':
      case undefined:
      default:
        const originalQueryString = typeof query === 'string' ? query : query.query;
        let replacedQuery = getTemplateSrv().replace(originalQueryString);
        if (replacedQuery.startsWith('Collection(') && replacedQuery.endsWith(')')) {
          let actualQuery = replacedQuery.replace('Collection(', '').slice(0, -1);
          promises.push(
            new Promise((resolve, reject) => {
              let out = chunk(actualQuery.split(','), 2).map(value => {
                return {
                  text: value[0],
                  value: value[1],
                };
              });
              resolve(out);
            })
          );
        } else if (replacedQuery.startsWith('CollectionLookup(') && replacedQuery.endsWith(')')) {
          let actualQuery = replacedQuery.replace('CollectionLookup(', '').slice(0, -1);
          let querySplit = actualQuery.split(',');
          promises.push(
            new Promise((resolve, reject) => {
              let chunkCollection = chunk(querySplit, 2);
              let out = chunkCollection
                .slice(0, -1)
                .map(value => {
                  return {
                    key: value[0],
                    value: value[1],
                  };
                })
                .find(v => {
                  return v.key === last(querySplit);
                });
              resolve(
                out
                  ? [
                      {
                        text: out.value,
                        value: out.value,
                      },
                    ]
                  : []
              );
            })
          );
        } else if (replacedQuery.startsWith('Join(') && replacedQuery.endsWith(')')) {
          let actualQuery = replacedQuery.replace('Join(', '').slice(0, -1);
          let querySplit = actualQuery.split(',');
          promises.push(
            new Promise((resolve, reject) => {
              let out = querySplit.join('');
              resolve([
                {
                  value: out,
                  text: out,
                },
              ]);
            })
          );
        } else if (replacedQuery.startsWith('Random(') && replacedQuery.endsWith(')')) {
          let replacedQuery = getTemplateSrv().replace(originalQueryString, undefined, 'csv');
          promises.push(
            new Promise((resolve, reject) => {
              let out = sample(
                replacedQuery
                  .replace('Random(', '')
                  .slice(0, -1)
                  .split(',')
              );
              resolve([
                {
                  value: out,
                  text: out,
                },
              ]);
            })
          );
        }
        break;
    }
    return Promise.all(promises).then(results => {
      return flatten(results);
    });
  }
}
