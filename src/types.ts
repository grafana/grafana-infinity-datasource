import { DataQuery, DataSourceJsonData, DataSourceInstanceSettings } from '@grafana/data';

//#region Settings
export const IGNORE_URL = '__IGNORE_URL__';
export interface GlobalInfinityQuery {
  name: string;
  id: string;
  query: InfinityQuery;
}
export type InfinityConfig = {
  tlsSkipVerify?: boolean;
  tlsAuth?: boolean;
  serverName?: string;
  tlsAuthWithCACert?: boolean;
  timeoutInSeconds?: number;
  global_queries?: GlobalInfinityQuery[];
  local_sources_options?: {
    enabled: boolean;
    allowed_paths?: string[];
  };
} & DataSourceJsonData;
export type InfinitySecureConfig = {
  basicAuthPassword?: string;
  tlsCACert?: string;
  tlsClientCert?: string;
  tlsClientKey?: string;
};
export type InfinityInstanceSettings = DataSourceInstanceSettings<InfinityConfig>;
//#endregion
//#region Grafana Type
export type dataPoint = [number | null, number];
export type timeSeriesResult = {
  target: string;
  datapoints: dataPoint[];
};
export type GrafanaTableColumn = {
  text: string;
  type: string;
};
export type GrafanaTableRowItem = string | number | object | null;
export type GrafanaTableRow = GrafanaTableRowItem[];
export type tableResult = {
  columns: GrafanaTableColumn[];
  rows: GrafanaTableRow;
};
//#endregion
//#region SeriesQuery
export interface DataOverride {
  values: string[];
  operator: string;
  override: string;
}
//#endregion
//#region General Types
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
//#endregion
//#region Query
export interface InfinityColumn {
  selector: string;
  text: string;
  type: 'string' | 'number' | 'timestamp' | 'timestamp_epoch' | 'timestamp_epoch_s';
}
export type InfinityQueryWithURL = {
  source: 'url';
  url: string;
  url_options: {
    method: 'GET' | 'POST';
    data?: string;
    params?: Array<{
      key: string;
      value: string;
    }>;
    headers?: Array<{
      key: string;
      value: string;
    }>;
  };
};
export type InfinityQueryWithInlineData = {
  source: 'inline';
  data: string;
};
export type InfinityQueryWithDataSource = {
  root_selector: string;
  columns: InfinityColumn[];
  filters?: InfinityFilter[];
  format: 'table' | 'timeseries' | 'dataframe';
} & (InfinityQueryWithURL | InfinityQueryWithInlineData);
export type InfinityJSONQuery = {
  type: 'json';
  json_options?: {
    root_is_not_array?: boolean;
    columnar?: boolean;
  };
} & InfinityQueryWithDataSource;
export type InfinityGraphqlQuery = {
  type: 'graphql';
  json_options?: {
    root_is_not_array?: boolean;
    columnar?: boolean;
  };
} & InfinityQueryWithDataSource;
export type InfinityCSVQuery = {
  type: 'csv';
  csv_options?: {
    delimiter?: string;
    skip_empty_lines?: boolean;
    skip_lines_with_error?: boolean;
    relax_column_count?: boolean;
    columns?: string;
    comment?: string;
  };
} & InfinityQueryWithDataSource;
export type InfinityXMLQuery = {
  type: 'xml';
} & InfinityQueryWithDataSource;
export type InfinityHTMLQuery = {
  type: 'html';
} & InfinityQueryWithDataSource;
export type InfinityRandomWalkQuery = {
  source: 'random-walk';
};
export type InfinityExpressionQuery = {
  source: 'expression';
  expression?: string;
};
export type InfinitySeriesQuery = {
  type: 'series';
  seriesCount?: number;
  alias?: string;
  dataOverrides?: DataOverride[];
} & (InfinityRandomWalkQuery | InfinityExpressionQuery);
export type InfinityGlobalQuery = {
  type: 'global';
  global_query_id?: string;
};
export type InfinityDataQuery = InfinityJSONQuery | InfinityGraphqlQuery | InfinityCSVQuery | InfinityXMLQuery | InfinityHTMLQuery;
export type InfinityLegacyQuery = InfinityDataQuery | InfinitySeriesQuery | InfinityGlobalQuery;
export type InfinityQuery = InfinityLegacyQuery & DataQuery;
export type InfinityVariableQuery = {
  queryType: 'legacy' | 'infinity';
  query: string;
  infinityQuery?: InfinityQuery;
};
export type VariableTokenLegacy = 'Collection' | 'CollectionLookup' | 'Random' | 'Join' | 'UnixTimeStamp';
//#endregion

//#region Defaults
export const defaultInfinityQuery: Omit<InfinityQuery, 'refId'> = {
  type: 'json',
};
//#endregion

//#region Editor Props
export enum EditorMode {
  Standard = 'standard',
  Global = 'global',
  Variable = 'variable',
}
//#endregion
