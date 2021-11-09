import { getTemplateSrv } from '@grafana/runtime';
import { ScopedVars } from '@grafana/data';
import { InfinityQuery, InfinityInstanceSettings } from '../types';
import { isDataQuery } from './utils';

const replaceVariable = (input: string, scopedVars: ScopedVars): string => {
  return getTemplateSrv().replace(input || '', scopedVars, 'glob');
};

export const replaceVariables = (query: InfinityQuery, scopedVars: ScopedVars): InfinityQuery => {
  const newQuery: InfinityQuery = { ...query };
  if (isDataQuery(newQuery)) {
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
    newQuery.filters = (newQuery.filters || []).map((filter) => {
      filter.value = filter.value.map((val) => {
        return getTemplateSrv().replace(val || '', scopedVars, 'glob');
      });
      return filter;
    });
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
