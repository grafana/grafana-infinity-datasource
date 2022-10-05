import { FilterOperator } from './../constants';
import type { DataQuery, SelectableValue } from '@grafana/data';

//#region Query
export type InfinityQueryType = 'json' | 'csv' | 'tsv' | 'xml' | 'graphql' | 'html' | 'series' | 'global' | 'uql' | 'groq' | 'google-sheets';
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
export type InfinityJSONQuery = (
  | { parser?: 'simple'; json_options?: InfinityJSONQueryOptions }
  | { parser: 'backend'; summarizeExpression?: string }
  | { parser: 'sqlite'; sqlite_query?: string }
  | { parser: 'uql'; uql?: string }
  | { parser: 'groq'; groq?: string }
) &
  InfinityQueryWithDataSource<'json'>;
export type InfinityCSVQueryOptions = {
  delimiter?: string;
  skip_empty_lines?: boolean;
  skip_lines_with_error?: boolean;
  relax_column_count?: boolean;
  columns?: string;
  comment?: string;
};
export type InfinityCSVQuery = {
  csv_options?: InfinityCSVQueryOptions;
  parser?: 'simple' | 'backend' | 'uql';
  summarizeExpression?: string;
  uql?: string;
} & InfinityQueryWithDataSource<'csv'>;
export type InfinityTSVQuery = {
  csv_options?: Exclude<InfinityCSVQueryOptions, 'delimiter'>;
  parser?: 'simple' | 'backend' | 'uql';
  summarizeExpression?: string;
  uql?: string;
} & InfinityQueryWithDataSource<'tsv'>;
export type InfinityXMLQuery = { parser?: 'simple' | 'uql'; uql?: string } & InfinityQueryWithDataSource<'xml'>;
export type InfinityGraphQLQuery = {
  json_options?: {
    root_is_not_array?: boolean;
    columnar?: boolean;
  };
  parser?: 'simple' | 'backend' | 'uql' | 'groq';
  summarizeExpression?: string;
  uql?: string;
  groq?: string;
} & InfinityQueryWithDataSource<'graphql'>;
export type InfinityHTMLQuery = {} & InfinityQueryWithDataSource<'html'>;
export type InfinitySeriesQueryBase<S extends InfinityQuerySources> = { seriesCount: number; alias: string; dataOverrides: DataOverride[] } & InfinityQueryWithSource<S> & InfinityQueryBase<'series'>;
export type InfinitySeriesQueryRandomWalk = {} & InfinitySeriesQueryBase<'random-walk'>;
export type InfinitySeriesQueryExpression = { expression?: string } & InfinitySeriesQueryBase<'expression'>;
export type InfinitySeriesQuery = InfinitySeriesQueryRandomWalk | InfinitySeriesQueryExpression;
export type InfinityGlobalQuery = { global_query_id: string } & InfinityQueryBase<'global'>;
export type InfinityDataQuery = InfinityJSONQuery | InfinityCSVQuery | InfinityTSVQuery | InfinityXMLQuery | InfinityGraphQLQuery | InfinityHTMLQuery;
export type InfinityDestinationQuery = InfinityDataQuery | InfinitySeriesQuery;
export type InfinityLegacyQuery = InfinityDestinationQuery | InfinityGlobalQuery;
export type InfinityUQLQuerySource = InfinityQueryWithURLSource<'uql'> | InfinityQueryWithInlineSource<'uql'>;
export type InfinityUQLQuery = { uql: string; format: InfinityQueryFormat } & InfinityUQLQuerySource & InfinityQueryBase<'uql'>;
export type InfinityGROQQuerySource = InfinityQueryWithURLSource<'groq'> | InfinityQueryWithInlineSource<'groq'>;
export type InfinityGROQQuery = { groq: string; format: InfinityQueryFormat } & InfinityGROQQuerySource & InfinityQueryBase<'groq'>;
export type InfinityGSheetsQuery = { spreadsheet: string; sheetName?: string; range: string } & InfinityQueryBase<'google-sheets'>;
export type InfinityQuery = InfinityLegacyQuery | InfinityUQLQuery | InfinityGROQQuery | InfinityGSheetsQuery;
//#endregion

//#region Misc
export interface ScrapQuerySources extends SelectableValue<InfinityQuerySources> {
  supported_types: InfinityQueryType[];
}
export interface InfinityColumn {
  selector: string;
  text: string;
  type: InfinityColumnFormat;
  timestampFormat?: string;
}
export interface DataOverride {
  values: string[];
  operator: string;
  override: string;
}

export interface InfinityFilter {
  field: string;
  operator: FilterOperator;
  value: string[];
}
export type QueryParam = { key: string; value: string };
export type QueryHeaders = { key: string; value: string };

//#endregion
