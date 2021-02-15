import { getTemplateSrv } from '@grafana/runtime';
import { ScopedVars } from '@grafana/data';
import { InfinityQuery, InfinityQuerySources, InfinityQueryType } from './../types';

export const replaceVariables = (query: InfinityQuery, scopedVars: ScopedVars): InfinityQuery => {
  query.url = getTemplateSrv().replace(query.url, scopedVars, 'glob');
  query.data = getTemplateSrv().replace(query.data, scopedVars, 'glob');
  if (query.url_options && query.url_options.data) {
    query.url_options.data = getTemplateSrv().replace(query.url_options.data, scopedVars, 'glob');
  }
  if (query.filters && query.filters.length > 0) {
    query.filters = query.filters.map(filter => {
      filter.value = filter.value.map(val => {
        return getTemplateSrv().replace(val, scopedVars, 'glob');
      });
      return filter;
    });
  }
  return query;
};

export const IsValidInfinityQuery = (query: InfinityQuery): boolean => {
  if (
    query &&
    query.type !== undefined &&
    [InfinityQueryType.CSV, InfinityQueryType.JSON, InfinityQueryType.XML].includes(query.type) &&
    query.source === InfinityQuerySources.URL
  ) {
    return query.url !== undefined && query.url !== '';
  } else if (
    query &&
    query.type !== undefined &&
    [InfinityQueryType.CSV, InfinityQueryType.JSON, InfinityQueryType.XML].includes(query.type) &&
    query.source === InfinityQuerySources.Inline
  ) {
    return query.data !== undefined && query.data !== '';
  } else {
    return query !== undefined && query.type !== undefined;
  }
};
