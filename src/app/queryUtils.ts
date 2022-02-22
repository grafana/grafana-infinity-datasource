import { getTemplateSrv } from '@grafana/runtime';
import { ScopedVars, DataSourceInstanceSettings, DataQueryRequest } from '@grafana/data';
import { isDataQuery, normalizeURL } from './utils';
import { InfinityQuery, InfinityInstanceSettings, InfinityOptions, GlobalInfinityQuery } from '../types';

const replaceVariable = (input: string, scopedVars: ScopedVars): string => {
  return getTemplateSrv().replace(input || '', scopedVars, 'glob');
};

export const overrideWithGlobalQuery = (t: InfinityQuery, instanceSettings: DataSourceInstanceSettings<InfinityOptions>): InfinityQuery => {
  if (t.type === 'global' && t.global_query_id && instanceSettings.jsonData.global_queries && instanceSettings.jsonData.global_queries.length > 0) {
    const global_query_id = t.global_query_id;
    let matchingQuery = instanceSettings.jsonData.global_queries.find((q: GlobalInfinityQuery) => q.id === global_query_id);
    return matchingQuery && global_query_id ? { ...matchingQuery.query, refId: t.refId } : t;
  }
  return t;
};

export const replaceVariables = (query: InfinityQuery, scopedVars: ScopedVars): InfinityQuery => {
  const newQuery: InfinityQuery = { ...query };
  if (isDataQuery(newQuery) || newQuery.type === 'uql' || newQuery.type === 'groq') {
    if (newQuery.source === 'url') {
      newQuery.url = replaceVariable(newQuery.url || '', scopedVars);
      newQuery.url_options = {
        ...newQuery.url_options,
        data: replaceVariable(newQuery.url_options?.data || '', scopedVars),
        params: newQuery.url_options?.params?.map((param) => {
          return {
            ...param,
            value: getTemplateSrv().replace(param?.value || '', scopedVars, 'glob'),
          };
        }),
        headers: newQuery.url_options?.headers?.map((header) => {
          return {
            ...header,
            value: getTemplateSrv().replace(header?.value || '', scopedVars, 'glob'),
          };
        }),
      };
    }
    if (newQuery.source === 'inline') {
      newQuery.data = replaceVariable(newQuery.data, scopedVars);
    }
    if (isDataQuery(newQuery)) {
      newQuery.filters = (newQuery.filters || []).map((filter) => {
        filter.value = filter.value.map((val) => {
          return getTemplateSrv().replace(val || '', scopedVars, 'glob');
        });
        return filter;
      });
    }
    if (newQuery.type === 'uql') {
      newQuery.uql = replaceVariable(newQuery.uql, scopedVars);
    }
    if (newQuery.type === 'groq') {
      newQuery.groq = replaceVariable(newQuery.groq, scopedVars);
    }
  }
  return newQuery;
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
      .map((t) => replaceVariables(t, options.scopedVars))
      .map((t) => ({ ...t, url: isDataQuery(t) && t.source === 'url' ? normalizeURL(t.url) : '' })),
  };
};
