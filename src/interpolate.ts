import { getTemplateSrv } from '@grafana/runtime';
import { ScopedVars } from '@grafana/data';
import { isDataQuery } from './app/utils';
import { InfinityQuery } from './types';

const replaceVariable = (input: string, scopedVars: ScopedVars): string => {
  return getTemplateSrv().replace(input || '', scopedVars, 'glob');
};

export const interpolateQuery = (query: InfinityQuery, scopedVars: ScopedVars): InfinityQuery => {
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
