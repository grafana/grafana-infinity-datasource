import { LoadingState, toDataFrame, DataFrame, DataQueryRequest, DataQueryResponse, ScopedVars, TimeRange } from '@grafana/data';
import { DataSourceWithBackend, HealthStatus } from '@grafana/runtime';
import { flatten, sample } from 'lodash';
import { Observable } from 'rxjs';
import { applyGroq } from './app/GROQProvider';
import { InfinityProvider } from './app/InfinityProvider';
import { SeriesProvider } from './app/SeriesProvider';
import { applyUQL } from './app/UQLProvider';
import { getUpdatedDataRequest, interpolateVariablesInQueries } from './app/queryUtils';
import { getTemplateVariablesFromResult, LegacyVariableProvider, migrateLegacyQuery } from './app/variablesQuery';
import { AnnotationsEditor } from './editors/annotation.editor';
import { interpolateQuery, interpolateVariableQuery } from './interpolate';
import { migrateQuery } from './migrate';
import { isBackendQuery } from './app/utils';
import { /*reportQuery,*/ reportHealthCheck } from './utils/analytics';
import type { InfinityInstanceSettings, InfinityOptions, InfinityQuery, MetricFindValue, VariableQuery } from './types';

export class Datasource extends DataSourceWithBackend<InfinityQuery, InfinityOptions> {
  constructor(public instanceSettings: InfinityInstanceSettings) {
    super(instanceSettings);
    this.annotations = {
      QueryEditor: AnnotationsEditor,
    };
  }
  query(options: DataQueryRequest<InfinityQuery>): Observable<DataQueryResponse> {
    return new Observable<DataQueryResponse>((subscriber) => {
      let request = getUpdatedDataRequest(options, this.instanceSettings);
      // TODO: Remove or change this to be fired less often
      // reportQuery(request?.targets || [], this.instanceSettings, this.meta, request?.app);
      super
        .query(request)
        .toPromise()
        .then((result) => this.getResults(request, result))
        .then((result) => subscriber.next({ ...result, state: LoadingState.Done }))
        .catch((error) => {
          console.error(error);
          subscriber.next({ data: [], error, state: LoadingState.Error });
          subscriber.error(error);
        })
        .finally(() => subscriber.complete());
    });
  }
  interpolateVariablesInQueries(queries: InfinityQuery[], scopedVars: ScopedVars) {
    return interpolateVariablesInQueries(queries, scopedVars);
  }
  metricFindQuery(originalQuery: VariableQuery, options?: { scopedVars: ScopedVars }): Promise<MetricFindValue[]> {
    let query = migrateLegacyQuery(originalQuery);
    query = interpolateVariableQuery(query);
    return new Promise((resolve) => {
      switch (query.queryType) {
        case 'random':
          if (query.values && query.values.length > 0) {
            const solvedValue = sample(query.values || []) || query.values[0];
            resolve([{ text: solvedValue, value: solvedValue, label: solvedValue }]);
          } else {
            const solvedValue = new Date().getTime().toString();
            resolve([{ text: solvedValue, value: solvedValue, label: solvedValue }]);
          }
          break;
        case 'infinity':
          if (query.infinityQuery) {
            let updatedQuery = migrateQuery(query.infinityQuery);
            const request = { targets: [interpolateQuery(updatedQuery, options?.scopedVars || {})] } as DataQueryRequest<InfinityQuery>;
            super
              .query(request)
              .toPromise()
              .then((res) => {
                this.getResults(request, res)
                  .then((r) => {
                    if (r?.data) {
                      resolve(getTemplateVariablesFromResult(r.data[0]) as MetricFindValue[]);
                    } else {
                      resolve([]);
                    }
                  })
                  .catch((ex) => {
                    console.error(ex);
                    resolve([]);
                  });
              })
              .catch((ex) => {
                console.error(ex);
                resolve([]);
              });
          } else {
            resolve([]);
          }
          break;
        case 'legacy':
        default:
          // eslint-disable-next-line no-case-declarations
          const legacyVariableProvider = new LegacyVariableProvider(query.query);
          legacyVariableProvider.query().then((res) => resolve(flatten(res)));
          break;
      }
    });
  }
  testDatasource() {
    return super
      .testDatasource()
      .then((o) => {
        reportHealthCheck(o, this.instanceSettings, this.meta);
        switch (o?.message) {
          case 'OK':
            if (this.instanceSettings?.jsonData?.auth_method === 'azureBlob' || this.instanceSettings?.jsonData?.auth_method === 'aws') {
              return Promise.resolve({ status: 'success', message: 'OK. Settings saved' });
            }
            if (!(this.instanceSettings?.jsonData?.customHealthCheckEnabled && this.instanceSettings?.jsonData?.customHealthCheckUrl) && this.instanceSettings?.jsonData?.auth_method) {
              const healthCheckMessage = [
                'Success',
                'Settings saved but no health checks performed',
                'To validate the connection/credentials, you have to provide a sample URL in Health Check section',
              ].join(`. `);
              return Promise.resolve({ status: 'warning', message: healthCheckMessage });
            }
            return Promise.resolve({ status: 'success', message: 'OK. Settings saved' });
          default:
            return Promise.resolve({ status: o?.status || 'success', message: o?.message || 'Settings saved' });
        }
      })
      .catch((ex) => {
        reportHealthCheck({ status: HealthStatus.Error, message: ex }, this.instanceSettings, this.meta);
        return Promise.resolve({ status: 'error', message: ex.message });
      });
  }
  getQueryDisplayText(query: InfinityQuery) {
    return (
      query.type.toUpperCase() +
      ((query.type === 'json' || query.type === 'csv' || query.type === 'xml' || query.type === 'uql' || query.type === 'graphql' || query.type === 'groq' || query.type === 'tsv') &&
      query.source === 'url'
        ? ` ${query.url}`
        : '')
    );
  }
  filterQuery(query: InfinityQuery) {
    if (query.hide) {
      return false;
    }
    return true;
  }
  private getResults(options: DataQueryRequest<InfinityQuery>, result?: DataQueryResponse): Promise<DataQueryResponse> {
    if (!result) {
      return Promise.resolve({ data: [], error: new Error('error getting the results. check grafana logs for more details'), state: LoadingState.Error });
    }
    if (result && result.error) {
      return Promise.resolve({ data: result?.data, error: result.error || new Error('error while getting the results. Refer grafana logs for more details'), state: LoadingState.Error });
    }
    const promises: Array<Promise<DataFrame>> = [];
    if (result && result.data) {
      result.data.map((d) => {
        const target: InfinityQuery = d.meta?.custom?.query;
        const data = d.meta?.custom?.data;
        const responseCodeFromServer = d.meta?.custom?.responseCodeFromServer;
        const error = d.meta?.custom?.error;
        if (isBackendQuery(target)) {
          promises.push(Promise.resolve(d));
        } else if (target.type === 'google-sheets') {
          promises.push(Promise.resolve(d));
        } else if (target.type === 'transformations') {
          promises.push(Promise.resolve(d));
        } else {
          promises.push(
            this.resolveData(target, options.range, options.scopedVars, data).then((r) => {
              if (target.type === 'json' && target.format === 'as-is') {
                return r;
              } else if (
                (target.type === 'csv' || target.type === 'json' || target.type === 'xml' || target.type === 'graphql' || target.type === 'uql' || target.type === 'groq') &&
                target.format !== 'timeseries'
              ) {
                const df = toDataFrame(r);
                let frame = { ...df, meta: d.meta || {}, refId: target.refId };
                if (target.format === 'logs') {
                  let doesTimeFieldExist = false;
                  let doesBodyFieldExist = false;
                  (df.fields || []).forEach((f) => {
                    if (f.name === 'timestamp' && f.type === 'time') {
                      doesTimeFieldExist = true;
                    }
                    if (f.name === 'body' && f.type === 'string') {
                      doesBodyFieldExist = true;
                    }
                  });
                  if (doesBodyFieldExist && doesTimeFieldExist) {
                    frame.meta.type = 'log-lines';
                    frame.meta.typeVersion = [0, 0];
                  }
                  frame.meta.preferredVisualisationType = 'logs';
                }
                if (target.format === 'trace') {
                  frame.meta.preferredVisualisationType = 'trace';
                }
                if (error || (responseCodeFromServer && responseCodeFromServer >= 400)) {
                  frame.meta.notices = [
                    {
                      severity: 'error',
                      text: `Response code from server : ${responseCodeFromServer}. Error Message : ${error || '-'}`,
                    },
                  ];
                } else if (responseCodeFromServer && responseCodeFromServer > 300) {
                  frame.meta.notices = [{ severity: 'warning', text: `Response Code From Server : ${responseCodeFromServer}` }];
                }
                if (target.format === 'node-graph-edges' || target.format === 'node-graph-nodes') {
                  frame.meta.preferredVisualisationType = 'nodeGraph';
                }
                return frame;
              }
              return r;
            })
          );
        }
      });
    }
    return Promise.all(promises)
      .then((results) => {
        return { data: flatten(results) };
      })
      .catch((ex) => {
        throw ex;
      });
  }
  private resolveData = (t: InfinityQuery, range: TimeRange, scopedVars: ScopedVars, data: string): Promise<any> => {
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
          if ((t.type === 'json' || t.type === 'csv' || t.type === 'tsv' || t.type === 'graphql' || t.type === 'xml') && t.parser === 'uql') {
            applyUQL(t.uql || '', data, t.format, t.refId)
              .then(resolve)
              .catch(reject);
            break;
          }
          if ((t.type === 'json' || t.type === 'graphql') && t.parser === 'groq') {
            applyGroq(t.groq || '', data, t.format, t.refId)
              .then(resolve)
              .catch(reject);
            break;
          }
          new InfinityProvider(t, this).formatResults(data).then(resolve).catch(reject);
          break;
        case 'uql':
          applyUQL(t.uql, data, t.format, t.refId).then(resolve).catch(reject);
          break;
        case 'groq':
          applyGroq(t.groq, data, t.format, t.refId).then(resolve).catch(reject);
          break;
        case 'series':
          new SeriesProvider(interpolateQuery(t, scopedVars)).query(new Date(range?.from?.toDate()).getTime(), new Date(range?.to?.toDate()).getTime()).then(resolve).catch(reject);
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
}
