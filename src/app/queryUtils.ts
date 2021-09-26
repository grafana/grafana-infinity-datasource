import { ScopedVars, DataSourceInstanceSettings } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { InfinityConfig, InfinityQuery, InfinityDataQuery, InfinityVariableQuery } from './../types';

const isDataSourceQuery = (query: InfinityQuery | InfinityDataQuery): query is InfinityDataQuery => {
  return query.type === 'csv' || query.type === 'json' || query.type === 'xml' || query.type === 'html' || query.type === 'graphql';
};

export const replaceVariables = (query: InfinityQuery, scopedVars: ScopedVars): InfinityQuery => {
  let newQuery = { ...query };
  if (isDataSourceQuery(newQuery)) {
    newQuery = {
      ...newQuery,
      filters: (newQuery.filters ? [...newQuery.filters] : []).map((filter) => {
        return {
          ...filter,
          value: filter.value.map((val) => getTemplateSrv().replace(val || '', scopedVars, 'glob')),
        };
      }),
    };
  }
  if (isDataSourceQuery(newQuery) && newQuery.source === 'url') {
    newQuery = {
      ...newQuery,
      url: getTemplateSrv().replace(newQuery.url, scopedVars, 'glob'),
      url_options: {
        ...newQuery.url_options,
        data: getTemplateSrv().replace(newQuery.url_options?.data || '', scopedVars, 'glob'),
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
      },
    };
  }
  if (isDataSourceQuery(newQuery) && newQuery.source === 'inline') {
    newQuery = {
      ...newQuery,
      data: getTemplateSrv().replace(newQuery.data, scopedVars, 'glob'),
    };
  }
  return newQuery;
};

export const replaceGlobalQuery = (query: InfinityQuery, instanceSettings: DataSourceInstanceSettings<InfinityConfig>): InfinityQuery => {
  if (
    query.type === 'global' &&
    query.global_query_id &&
    instanceSettings &&
    instanceSettings.jsonData &&
    instanceSettings.jsonData.global_queries
  ) {
    let matchingQuery = instanceSettings.jsonData.global_queries.find((q) => q.id === query.global_query_id);
    return matchingQuery && matchingQuery.query ? matchingQuery.query : query;
  }
  return query;
};

export const migrateLegacyVariableQuery = (query?: InfinityVariableQuery | string): InfinityVariableQuery => {
  if (!query) {
    return { queryType: 'infinity', infinityQuery: { type: 'json' } as InfinityQuery };
  } else if (typeof query === 'string') {
    return { queryType: 'legacy', query };
  } else {
    return query.queryType === 'legacy'
      ? { ...query, query: query.query || '' }
      : { ...query, infinityQuery: query.infinityQuery || { type: 'json' } };
  }
};
