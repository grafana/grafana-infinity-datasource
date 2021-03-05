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
  type: 'string' | 'number' | 'timestamp' | 'timestamp_epoch';
}
export interface DataOverride {
  values: string[];
  operator: string;
  override: string;
}
export interface InfinityQuery extends DataQuery {
  type: 'json' | 'html' | 'csv' | 'graphql' | 'series' | 'global';
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
    supported_types: ['csv', 'json', 'html', 'graphql'],
  },
  {
    label: 'Inline',
    value: 'inline',
    supported_types: ['csv', 'json'],
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
];
