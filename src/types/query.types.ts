import { FilterOperator } from './../constants';
import type { DataQuery, SelectableValue } from '@grafana/data';

//#region Query
export type InfinityQueryType = 'json' | 'csv' | 'tsv' | 'xml' | 'graphql' | 'html' | 'series' | 'global' | 'uql' | 'groq' | 'google-sheets' | 'transformations';
export type InfinityQuerySources = 'url' | 'inline' | 'azure-blob' | 'reference' | 'random-walk' | 'expression';
export type InfinityColumnFormat = 'string' | 'number' | 'timestamp' | 'timestamp_epoch' | 'timestamp_epoch_s' | 'boolean';
export type InfinityQueryFormat = 'table' | 'timeseries' | 'logs' | 'trace' | 'node-graph-nodes' | 'node-graph-edges' | 'dataframe' | 'as-is';
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
  body_graphql_variables?: string;
};
export type InfinityQueryWithReferenceSource<T extends InfinityQueryType> = {
  referenceName: string;
} & InfinityQueryWithSource<'reference'> &
  InfinityQueryBase<T>;
export type InfinityQueryWithURLSource<T extends InfinityQueryType> = {
  url: string;
  url_options: InfinityURLOptions;
} & InfinityQueryWithSource<'url'> &
  InfinityQueryBase<T>;
export type InfinityQueryWithAzureBlobSource<T extends InfinityQueryType> = {
  azContainerName: string;
  azBlobName: string;
} & InfinityQueryWithSource<'azure-blob'> &
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
} & (InfinityQueryWithURLSource<T> | InfinityQueryWithInlineSource<T> | InfinityQueryWithReferenceSource<T> | InfinityQueryWithAzureBlobSource<T>) &
  InfinityQueryBase<T>;
export type InfinityJSONQueryOptions = {
  root_is_not_array?: boolean;
  columnar?: boolean;
};
export type BackendParserOptions = { filterExpression?: string; summarizeExpression?: string; summarizeAlias?: string; summarizeBy?: string; computed_columns?: InfinityColumn[] };
export type InfinityJSONQuery = (
  | { parser?: 'simple'; json_options?: InfinityJSONQueryOptions }
  | ({ parser: 'backend' } & BackendParserOptions)
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
export type InfinityCSVQuery = (
  | { parser?: 'simple'; csv_options?: InfinityCSVQueryOptions }
  | { parser: 'uql'; uql: string }
  | ({ parser: 'backend'; csv_options?: InfinityCSVQueryOptions } & BackendParserOptions)
) &
  InfinityQueryWithDataSource<'csv'>;
export type InfinityTSVQuery = (
  | { parser?: 'simple'; csv_options?: Exclude<InfinityCSVQueryOptions, 'delimiter'> }
  | { parser: 'uql'; uql: string }
  | ({ parser: 'backend'; csv_options?: Exclude<InfinityCSVQueryOptions, 'delimiter'> } & BackendParserOptions)
) &
  InfinityQueryWithDataSource<'tsv'>;
export type InfinityXMLQuery = ({ parser?: 'simple' } | { parser: 'uql'; uql: string } | ({ parser: 'backend' } & BackendParserOptions)) & InfinityQueryWithDataSource<'xml'>;
export type InfinityGraphQLQuery = (
  | { parser?: 'simple'; json_options?: { root_is_not_array?: boolean; columnar?: boolean } }
  | ({ parser: 'backend' } & BackendParserOptions)
  | { parser: 'uql'; uql: string }
  | { parser: 'groq'; groq: string }
) &
  InfinityQueryWithDataSource<'graphql'>;
export type InfinityHTMLQuery = ({ parser?: 'simple' } | ({ parser: 'backend' } & BackendParserOptions)) & InfinityQueryWithDataSource<'html'>;
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
export type InfinityGSheetsQuery = { spreadsheet: string; sheetName?: string; range: string; columns: InfinityColumn[] } & InfinityQueryBase<'google-sheets'>;
export type PaginationType = 'none' | 'offset' | 'page' | 'cursor' | 'list';
export type PaginationParamType = 'query' | 'header' | 'body_data' | 'body_json' | 'replace';
export type PaginationBase<T extends PaginationType> = { pagination_mode?: T; pagination_max_pages?: number };
export type PaginationNone = {} & PaginationBase<'none'>;
export type PaginationOffset = {
  pagination_param_size_field_name?: string;
  pagination_param_size_field_type?: PaginationParamType;
  pagination_param_size_value?: number;
  pagination_param_offset_field_name?: string;
  pagination_param_offset_field_type?: PaginationParamType;
  pagination_param_offset_value?: number;
} & PaginationBase<'offset'>;
export type PaginationPage = {
  pagination_param_size_field_name?: string;
  pagination_param_size_field_type?: PaginationParamType;
  pagination_param_size_value?: number;
  pagination_param_page_field_name?: string;
  pagination_param_page_field_type?: PaginationParamType;
  pagination_param_page_value?: number;
} & PaginationBase<'page'>;
export type PaginationCursor = {
  pagination_param_size_field_name?: string;
  pagination_param_size_field_type?: PaginationParamType;
  pagination_param_size_value?: number;
  pagination_param_cursor_field_name?: string;
  pagination_param_cursor_field_type?: PaginationParamType;
  pagination_param_cursor_extraction_path?: string;
} & PaginationBase<'cursor'>;
export type PaginationList = {
  pagination_param_list_field_name?: string;
  pagination_param_list_field_type?: PaginationParamType;
  pagination_param_list_value?: string;
} & PaginationBase<'list'>;
export type Pagination = PaginationNone | PaginationOffset | PaginationPage | PaginationCursor | PaginationList;
export type Transformation = 'limit' | 'filterExpression' | 'summarize' | 'computedColumn';
export type TransformationItem = {
  type: Transformation;
  disabled?: boolean;
  limit?: {
    limitField?: number;
  };
  filterExpression?: {
    expression?: string;
  };
  computedColumn?: {
    expression?: string;
    alias: string;
  };
  summarize?: {
    expression?: string;
    by?: string;
    alias?: string;
  };
};
export type TransformationsQuery = {
  transformations: TransformationItem[];
} & InfinityQueryBase<'transformations'>;
export type InfinityQuery = (InfinityLegacyQuery | InfinityUQLQuery | InfinityGROQQuery | InfinityGSheetsQuery | TransformationsQuery) & Pagination;
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
