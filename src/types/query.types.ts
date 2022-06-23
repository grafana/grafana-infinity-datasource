import { DataQuery, SelectableValue } from '@grafana/data';

//#region Query
export type InfinityQueryType = 'json' | 'json-backend' | 'csv' | 'tsv' | 'xml' | 'graphql' | 'html' | 'series' | 'global' | 'uql' | 'groq';
export type InfinityQuerySources = 'url' | 'inline' | 'random-walk' | 'expression';
export type InfinityColumnFormat = 'string' | 'number' | 'timestamp' | 'timestamp_epoch' | 'timestamp_epoch_s';
export type InfinityQueryFormat = 'table' | 'timeseries' | 'dataframe' | 'as-is' | 'node-graph-nodes' | 'node-graph-edges';
export type QueryBodyType = 'none' | 'form-data' | 'x-www-form-urlencoded' | 'raw' | 'graphql';
export type QueryBodyContentType = 'text/plain' | 'application/json' | 'application/xml' | 'text/html' | 'application/javascript';
export type InfinityQueryBase<T extends InfinityQueryType> = { type: T } & DataQuery;
export type InfinityQueryWithSource<S extends InfinityQuerySources> = { source: S } & DataQuery;
export type InfinityKV = { key: string; value: string };
export type InfinityURLOptions = {
  method: 'GET' | 'POST';
  params?: InfinityKV[];
  headers?: InfinityKV[];
  data?: string;
  body_type?: QueryBodyType;
  body_content_type?: QueryBodyContentType;
  body_form?: InfinityKV[];
  body_graphql_query?: string;
  // body_graphql_variables?: string;
};
export type InfinityQueryWithURLSource<T extends InfinityQueryType> = {
  url: string;
  url_options: InfinityURLOptions;
} & InfinityQueryWithSource<'url'> &
  InfinityQueryBase<T>;
export type InfinityQueryWithInlineSource<T extends InfinityQueryType> = {
  data: string;
} & InfinityQueryWithSource<'inline'> &
  InfinityQueryBase<T>;
export type InfinityQueryWithRandomWalkSource = {} & InfinityQueryWithSource<'random-walk'>;
export type InfinityQueryWithExpressionSource = {} & InfinityQueryWithSource<'expression'>;
export type InfinityQueryWithDataSource<T extends InfinityQueryType> = {
  root_selector: string;
  columns: InfinityColumn[];
  filters?: InfinityFilter[];
  format: InfinityQueryFormat;
} & (InfinityQueryWithURLSource<T> | InfinityQueryWithInlineSource<T>) &
  InfinityQueryBase<T>;
export type InfinityJSONQueryOptions = {
  root_is_not_array?: boolean;
  columnar?: boolean;
};
export type InfinityJSONQuery = { json_options?: InfinityJSONQueryOptions } & InfinityQueryWithDataSource<'json'>;
export type InfinityJSONBackendQuery = {} & InfinityQueryWithDataSource<'json-backend'>;
export type InfinityCSVQueryOptions = {
  delimiter?: string;
  skip_empty_lines?: boolean;
  skip_lines_with_error?: boolean;
  relax_column_count?: boolean;
  columns?: string;
  comment?: string;
};
export type InfinityCSVQuery = { csv_options?: InfinityCSVQueryOptions } & InfinityQueryWithDataSource<'csv'>;
export type InfinityTSVQuery = { csv_options?: Exclude<InfinityCSVQueryOptions, 'delimiter'> } & InfinityQueryWithDataSource<'tsv'>;
export type InfinityXMLQuery = {} & InfinityQueryWithDataSource<'xml'>;
export type InfinityGraphQLQuery = {
  json_options?: {
    root_is_not_array?: boolean;
    columnar?: boolean;
  };
} & InfinityQueryWithDataSource<'graphql'>;
export type InfinityHTMLQuery = {} & InfinityQueryWithDataSource<'html'>;
export type InfinitySeriesQueryBase<S extends InfinityQuerySources> = { seriesCount: number; alias: string; dataOverrides: DataOverride[] } & InfinityQueryWithSource<S> & InfinityQueryBase<'series'>;
export type InfinitySeriesQueryRandomWalk = {} & InfinitySeriesQueryBase<'random-walk'>;
export type InfinitySeriesQueryExpression = { expression?: string } & InfinitySeriesQueryBase<'expression'>;
export type InfinitySeriesQuery = InfinitySeriesQueryRandomWalk | InfinitySeriesQueryExpression;
export type InfinityGlobalQuery = { global_query_id: string } & InfinityQueryBase<'global'>;
export type InfinityDataQuery = InfinityJSONQuery | InfinityJSONBackendQuery | InfinityCSVQuery | InfinityTSVQuery | InfinityXMLQuery | InfinityGraphQLQuery | InfinityHTMLQuery;
export type InfinityDestinationQuery = InfinityDataQuery | InfinitySeriesQuery;
export type InfinityLegacyQuery = InfinityDestinationQuery | InfinityGlobalQuery;
export type InfinityUQLQuerySource = InfinityQueryWithURLSource<'uql'> | InfinityQueryWithInlineSource<'uql'>;
export type InfinityUQLQuery = { uql: string; format: InfinityQueryFormat } & InfinityUQLQuerySource & InfinityQueryBase<'uql'>;
export type InfinityGROQQuerySource = InfinityQueryWithURLSource<'groq'> | InfinityQueryWithInlineSource<'groq'>;
export type InfinityGROQQuery = { groq: string; format: InfinityQueryFormat } & InfinityGROQQuerySource & InfinityQueryBase<'groq'>;
export type InfinityQuery = InfinityLegacyQuery | InfinityUQLQuery | InfinityGROQQuery;
//#endregion

//#region Misc
interface ScrapQuerySources extends SelectableValue<InfinityQuerySources> {
  supported_types: InfinityQueryType[];
}
export interface InfinityColumn {
  selector: string;
  text: string;
  type: InfinityColumnFormat;
}
export interface DataOverride {
  values: string[];
  operator: string;
  override: string;
}
export enum FilterOperator {
  Contains = 'contains',
  ContainsIgnoreCase = 'contains_ignorecase',
  EndsWith = 'endswith',
  EndsWithIgnoreCase = 'endswith_ignorecase',
  Equals = 'equals',
  EqualsIgnoreCase = 'equals_ignorecase',
  NotContains = 'notcontains',
  NotContainsIgnoreCase = 'notcontains_ignorecase',
  NotEquals = 'notequals',
  NotEqualsIgnoreCase = 'notequals_ignorecase',
  StartsWith = 'starswith',
  StartsWithIgnoreCase = 'starswith_ignorecase',
  RegexMatch = 'regex',
  RegexNotMatch = 'regex_not',
  In = 'in',
  NotIn = 'notin',
  NumberEquals = '==',
  NumberNotEquals = '!=',
  NumberLessThan = '<',
  NumberLessThanOrEqualTo = '<=',
  NumberGreaterThan = '>',
  NumberGreaterThanOrEqualTo = '>=',
}
export interface InfinityFilter {
  field: string;
  operator: FilterOperator;
  value: string[];
}
export type QueryParam = { key: string; value: string };
export type QueryHeaders = { key: string; value: string };
export const SCRAP_QUERY_TYPES: Array<SelectableValue<InfinityQueryType>> = [
  { label: 'UQL', value: 'uql' },
  { label: 'JSON', value: 'json' },
  { label: 'CSV', value: 'csv' },
  { label: 'TSV', value: 'tsv' },
  { label: 'GraphQL', value: 'graphql' },
  { label: 'XML', value: 'xml' },
  { label: 'HTML', value: 'html' },
  { label: 'Series', value: 'series' },
  { label: 'Global Query', value: 'global' },
  { label: 'GROQ', value: 'groq' },
  { label: 'JSON (backend - experimental)', value: 'json-backend' },
];
export const INFINITY_RESULT_FORMATS: Array<SelectableValue<InfinityQueryFormat>> = [
  { label: 'Data Frame', value: 'dataframe' },
  { label: 'Table', value: 'table' },
  { label: 'Time Series', value: 'timeseries' },
  { label: 'Nodes - Node Graph', value: 'node-graph-nodes' },
  { label: 'Edges - Node Graph', value: 'node-graph-edges' },
  { label: 'As Is', value: 'as-is' },
];
export const INFINITY_SOURCES: ScrapQuerySources[] = [
  { label: 'URL', value: 'url', supported_types: ['csv', 'tsv', 'json', 'json-backend', 'html', 'xml', 'graphql', 'uql', 'groq'] },
  { label: 'Inline', value: 'inline', supported_types: ['csv', 'tsv', 'json', 'json-backend', 'xml', 'uql', 'groq'] },
  { label: 'Random Walk', value: 'random-walk', supported_types: ['series'] },
  { label: 'Expression', value: 'expression', supported_types: ['series'] },
];
export const INFINITY_COLUMN_FORMATS: Array<SelectableValue<InfinityColumnFormat>> = [
  { label: 'String', value: 'string' },
  { label: 'Number', value: 'number' },
  { label: 'Timestamp', value: 'timestamp' },
  { label: 'Timestamp ( UNIX ms )', value: 'timestamp_epoch' },
  { label: 'Timestamp ( UNIX s )', value: 'timestamp_epoch_s' },
];

//#endregion

export const DefaultInfinityQuery: InfinityQuery = {
  refId: '',
  type: 'json',
  source: 'url',
  format: 'table',
  url: 'https://jsonplaceholder.typicode.com/users',
  url_options: { method: 'GET', data: '' },
  root_selector: '',
  columns: [],
  filters: [],
};
