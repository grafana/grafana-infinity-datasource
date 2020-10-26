import { flatten, chunk, last, sample } from 'lodash';
import { DataSourceApi } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { InfinityProvider } from './app/InfinityProvider';
import { SeriesProvider } from './app/SeriesProvider';
import { replaceVariables } from './utils';
import { InfinityQuery, GlobalInfinityQuery } from './types';

export class Datasource extends DataSourceApi<InfinityQuery> {
  instanceSettings: any;
  constructor(iSettings: any) {
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
  query(options: any) {
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
          let matchingQuery: GlobalInfinityQuery = this.instanceSettings.jsonData.global_queries.find(
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
                  .query(options.range.from, options.range.to)
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
  annotationQuery(options: any) {
    const promises: any[] = [];
    return Promise.all(promises).then(results => {
      return [];
    });
  }
  metricFindQuery(query: string) {
    const promises: any[] = [];
    let replacedQuery = getTemplateSrv().replace(query);
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
                    text: out.key,
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
      let replacedQuery = getTemplateSrv().replace(query, undefined, 'csv');
      let actualQuery = replacedQuery.replace('Random(', '').slice(0, -1);
      let querySplit = actualQuery.split(',');
      promises.push(
        new Promise((resolve, reject) => {
          let out = sample(querySplit);
          resolve([
            {
              value: out,
              text: out,
            },
          ]);
        })
      );
    }
    return Promise.all(promises).then(results => {
      return flatten(results);
    });
  }
}
