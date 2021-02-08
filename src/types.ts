import { DataQuery } from '@grafana/data';

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
export type queryResult = timeSeriesResult | tableResult;
export interface ScrapColumn {
  selector: string;
  text: string;
  type: 'string' | 'number' | 'timestamp' | 'timestamp_epoch' | 'timestamp_epoch_s';
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
export interface InfinityQuery extends DataQuery {
  type: 'json' | 'html' | 'csv' | 'xml' | 'graphql' | 'series' | 'global';
  source: 'url' | 'inline' | 'random-walk' | 'expression';
  url: string;
  url_options: {
    method: 'GET' | 'POST';
    data?: string;
  };
  data: string;
  root_selector: string;
  global_query_id?: string;
  columns: ScrapColumn[];
  alias?: string;
  seriesCount?: number;
  expression?: string;
  filters: InfinityFilter[];
  dataOverrides?: DataOverride[];
  format: 'table' | 'timeseries';
}
export interface GlobalInfinityQuery {
  name: string;
  id: string;
  query: InfinityQuery;
}
export const SCRAP_QUERY_TYPES = [
  {
    label: 'CSV',
    value: 'csv',
  },
  {
    label: 'JSON',
    value: 'json',
  },
  {
    label: 'XML',
    value: 'xml',
  },
  {
    label: 'HTML',
    value: 'html',
  },
  {
    label: 'GraphQL',
    value: 'graphql',
  },
  {
    label: 'Series',
    value: 'series',
  },
  {
    label: 'Global Query',
    value: 'global',
  },
];
export const SCRAP_QUERY_RESULT_FORMATS = [
  {
    label: 'Table',
    value: 'table',
  },
  {
    label: 'Time Series',
    value: 'timeseries',
  },
];
export const SCRAP_QUERY_SOURCES = [
  {
    label: 'URL',
    value: 'url',
    supported_types: ['csv', 'json', 'html', 'xml', 'graphql'],
  },
  {
    label: 'Inline',
    value: 'inline',
    supported_types: ['csv', 'json', 'xml'],
  },
  {
    label: 'Random Walk',
    value: 'random-walk',
    supported_types: ['series'],
  },
  {
    label: 'Expression',
    value: 'expression',
    supported_types: ['series'],
  },
];
export const SCRAP_QUERY_RESULT_COLUMN_FORMATS = [
  {
    label: 'String',
    value: 'string',
  },
  {
    label: 'Number',
    value: 'number',
  },
  {
    label: 'Timestamp',
    value: 'timestamp',
  },
  {
    label: 'Timestamp ( UNIX ms )',
    value: 'timestamp_epoch',
  },
  {
    label: 'Timestamp ( UNIX s )',
    value: 'timestamp_epoch_s',
  },
];
