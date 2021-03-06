import { flatten, chunk, last } from 'lodash';
import { DataQueryRequest, DataQueryResponse, DataSourceInstanceSettings } from '@grafana/data';
import { getTemplateSrv, DataSourceWithBackend } from '@grafana/runtime';
import { InfinityQuery, InfinityOptions } from '../shared/types';
import { replaceVariables } from '../shared/utils';
import { Observable } from 'rxjs';

export class DataSource extends DataSourceWithBackend<InfinityQuery, InfinityOptions> {
  instanceSettings: any;
  constructor(iSettings: DataSourceInstanceSettings<InfinityOptions>) {
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
  query(request: DataQueryRequest<InfinityQuery>): Observable<DataQueryResponse> {
    return super.query({
      ...request,
      targets: request.targets
        .filter((t: InfinityQuery) => t.hide !== true)
        .map((t: InfinityQuery) => replaceVariables(t, request.scopedVars)),
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
    }
    return Promise.all(promises).then(results => {
      return flatten(results);
    });
  }
}
