import { DataSourceInstanceSettings, DataQueryRequest } from '@grafana/data';
import { isDataQuery, normalizeURL } from './utils';
import { interpolateQuery } from './../interpolate';
import { InfinityQuery, InfinityInstanceSettings, InfinityOptions, GlobalInfinityQuery } from '../types';

export const overrideWithGlobalQuery = (t: InfinityQuery, instanceSettings: DataSourceInstanceSettings<InfinityOptions>): InfinityQuery => {
  if (t.type === 'global' && t.global_query_id && instanceSettings.jsonData.global_queries && instanceSettings.jsonData.global_queries.length > 0) {
    const global_query_id = t.global_query_id;
    let matchingQuery = instanceSettings.jsonData.global_queries.find((q: GlobalInfinityQuery) => q.id === global_query_id);
    return matchingQuery && global_query_id ? { ...matchingQuery.query, refId: t.refId } : t;
  }
  return t;
};

export const IsValidInfinityQuery = (query: InfinityQuery): boolean => {
  if (query && (query.type === 'csv' || query.type === 'tsv' || query.type === 'graphql' || query.type === 'json' || query.type === 'xml')) {
    if (query.source === 'url') {
      return query.url !== undefined && query.url !== '';
    } else {
      return query.data !== undefined && query.data !== '';
    }
  } else {
    return query !== undefined && query.type !== undefined;
  }
};

export const getDefaultGlobalQueryID = (ins: InfinityInstanceSettings): string => {
  let queries = ins.jsonData.global_queries;
  return queries && queries.length > 0 ? queries[0].id : '';
};

export const getUpdatedDataRequest = (options: DataQueryRequest<InfinityQuery>, instanceSettings: DataSourceInstanceSettings<InfinityOptions>): DataQueryRequest<InfinityQuery> => {
  return {
    ...options,
    targets: options.targets
      .filter((t: InfinityQuery) => t.hide !== true)
      .map((t) => overrideWithGlobalQuery(t, instanceSettings))
      .filter((t) => t.type !== 'global')
      .map((t) => interpolateQuery(t, options.scopedVars))
      .map((t) => {
        if ((isDataQuery(t) || t.type === 'uql' || t.type === 'groq') && t.source === 'url') {
          t.url = normalizeURL(t.url);
        }
        return t;
      }),
  };
};
