import { interpolateQuery } from './../interpolate';
import { migrateQuery } from './../migrate';
import type { GlobalInfinityQuery, InfinityInstanceSettings, InfinityOptions, InfinityQuery } from './../types';
import type { DataQueryRequest, DataSourceInstanceSettings, ScopedVars } from '@grafana/data';

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
    } else if (query.source === 'reference') {
      return query.referenceName !== undefined && query.referenceName !== '';
    } else if (query.source === 'azure-blob') {
      return query.azBlobName === '' || query.azContainerName === '';
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
    targets: interpolateVariablesInQueries(
      options.targets
        .filter((t: InfinityQuery) => t.hide !== true)
        .map((t) => overrideWithGlobalQuery(t, instanceSettings))
        .filter((t) => t.type !== 'global'),
      options.scopedVars
    ),
  };
};

export const interpolateVariablesInQueries = (queries: InfinityQuery[], scopedVars: ScopedVars): InfinityQuery[] => {
  return queries.map((t) => migrateQuery(t)).map((t) => interpolateQuery(t, scopedVars));
};
