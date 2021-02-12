import { DataQuery, SelectableValue } from '@grafana/data';

export interface MetricFindValue {
  text: string;
  value?: string | number;
  expandable?: boolean;
}

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
export type InfinityQueryType = 'json' | 'html' | 'csv' | 'xml' | 'graphql' | 'series' | 'global';
export type InfinityQueryFormat = 'table' | 'timeseries';
export type InfinityQuerySources = 'url' | 'inline' | 'random-walk' | 'expression';
export type ScrapColumnFormat = 'string' | 'number' | 'timestamp' | 'timestamp_epoch' | 'timestamp_epoch_s';
export type EditorMode = 'standard' | 'global' | 'variable';
interface ScrapQuerySources extends SelectableValue<InfinityQuerySources> {
  supported_types: InfinityQueryType[];
}
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
  type: InfinityQueryType;
  source: InfinityQuerySources;
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
  filters?: InfinityFilter[];
  dataOverrides?: DataOverride[];
  format: InfinityQueryFormat;
}
export interface GlobalInfinityQuery {
  name: string;
  id: string;
  query: InfinityQuery;
}
export const SCRAP_QUERY_TYPES: Array<SelectableValue<InfinityQueryType>> = [
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
export const SCRAP_QUERY_RESULT_FORMATS: Array<SelectableValue<InfinityQueryFormat>> = [
  {
    label: 'Table',
    value: 'table',
  },
  {
    label: 'Time Series',
    value: 'timeseries',
  },
];
export const SCRAP_QUERY_SOURCES: ScrapQuerySources[] = [
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
export const SCRAP_QUERY_RESULT_COLUMN_FORMATS: Array<SelectableValue<ScrapColumnFormat>> = [
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
export type VariableQueryType = 'legacy' | 'infinity';
export type VariableQuery = {
  queryType: VariableQueryType;
  query: string;
  infinityQuery?: InfinityQuery;
};
