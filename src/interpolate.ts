import { getTemplateSrv } from '@grafana/runtime';
import { isBackendQuery, isDataQuery } from '@/app/utils';
import type { ScopedVars } from '@grafana/data';
import type { InfinityKV, QueryBodyContentType, QueryBodyType, InfinityQuery, VariableQuery } from '@/types';

const templateSrv = getTemplateSrv();

const replaceVariable = (input = '', scopedVars: ScopedVars = {}, format = 'glob'): string => {
  return templateSrv.replace(input, scopedVars, format);
};

const replaceVariableInKV = (input: InfinityKV[] | undefined = [], scopedVars: ScopedVars = {}, format = 'glob') => {
  return input.map((f) => {
    return { ...f, value: replaceVariable(f?.value || '', scopedVars, format) };
  });
};

export const interpolateQuery = (query: InfinityQuery, scopedVars: ScopedVars): InfinityQuery => {
  const newQuery: InfinityQuery = { ...query };
  if (isDataQuery(newQuery) || newQuery.type === 'uql' || newQuery.type === 'groq') {
    if (newQuery.source === 'url') {
      newQuery.url = replaceVariable(newQuery.url || '', scopedVars);
      newQuery.url_options = {
        ...newQuery.url_options,
        data: replaceVariable(newQuery.url_options?.data || '', scopedVars),
        body_type: replaceVariable(newQuery.url_options?.body_type || '', scopedVars) as QueryBodyType,
        body_content_type: replaceVariable(newQuery.url_options?.body_content_type || '', scopedVars) as QueryBodyContentType,
        body_graphql_query: replaceVariable(newQuery.url_options?.body_graphql_query || '', scopedVars),
        body_graphql_variables: replaceVariable(newQuery.url_options?.body_graphql_variables || '', scopedVars),
        body_form: replaceVariableInKV(newQuery.url_options?.body_form, scopedVars),
        params: replaceVariableInKV(newQuery.url_options?.params, scopedVars),
        headers: replaceVariableInKV(newQuery.url_options?.headers, scopedVars),
      };
      if (newQuery.pagination_mode === 'list') {
        newQuery.pagination_param_list_value = replaceVariable(newQuery.pagination_param_list_value || '', scopedVars);
      }
    }
    if (newQuery.source === 'inline') {
      newQuery.data = replaceVariable(newQuery.data, scopedVars);
    }
    if (newQuery.source === 'azure-blob') {
      newQuery.azBlobName = replaceVariable(newQuery.azBlobName, scopedVars);
      newQuery.azContainerName = replaceVariable(newQuery.azContainerName, scopedVars);
    }
    if (isDataQuery(newQuery)) {
      newQuery.filters = (newQuery.filters || []).map((filter) => {
        const value = (filter.value || []).map((val) => {
          return replaceVariable(val || '', scopedVars);
        });
        return { ...filter, value };
      });
    }
    if (
      newQuery.type === 'uql' ||
      ((newQuery.type === 'json' || newQuery.type === 'csv' || newQuery.type === 'tsv' || newQuery.type === 'graphql' || newQuery.type === 'xml') && newQuery.parser === 'uql')
    ) {
      newQuery.uql = replaceVariable(newQuery.uql || '', scopedVars);
    }
    if (newQuery.type === 'groq' || (newQuery.type === 'json' && newQuery.parser === 'groq')) {
      newQuery.groq = replaceVariable(newQuery.groq || '', scopedVars);
    }
    if (isBackendQuery(newQuery)) {
      newQuery.root_selector = replaceVariable(newQuery.root_selector || '', scopedVars);
      newQuery.computed_columns = (newQuery.computed_columns || []).map((c) => {
        return {
          ...c,
          selector: replaceVariable(c.selector || '', scopedVars),
        };
      });
      newQuery.filterExpression = replaceVariable(newQuery.filterExpression || '', scopedVars);
      newQuery.summarizeExpression = replaceVariable(newQuery.summarizeExpression || '', scopedVars);
    }
  }
  if (newQuery.type === 'google-sheets') {
    newQuery.spreadsheet = replaceVariable(newQuery.spreadsheet, scopedVars);
    newQuery.sheetName = replaceVariable(newQuery.sheetName, scopedVars);
    newQuery.sheetRange = replaceVariable(newQuery.sheetRange, scopedVars);
  }
  return newQuery;
};

export const interpolateVariableQuery = (query: VariableQuery): VariableQuery => {
  switch (query.queryType) {
    case 'random':
      return {
        ...query,
        values: (query.values || []).map((v) => replaceVariable(v)),
      };
    default:
      return {
        ...query,
      };
  }
};
