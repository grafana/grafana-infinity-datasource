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
export const enum HealthCheckResultStatus {
  Success = 'success',
  Failure = 'error',
}
export type HealthCheckResult = {
  message: string;
  status: HealthCheckResultStatus;
};

export type queryResult = timeSeriesResult | tableResult;
export const enum InfinityQueryType {
  JSON = 'json',
  HTML = 'html',
  CSV = 'csv',
  XML = 'xml',
  GraphQL = 'graphql',
  Series = 'series',
  Global = 'global',
}
export const enum InfinityQueryFormat {
  Table = 'table',
  TimeSeries = 'timeseries',
}
export const enum InfinityQuerySources {
  URL = 'url',
  Inline = 'inline',
  RandomWalk = 'random-walk',
  Expression = 'expression',
}
export const enum ScrapColumnFormat {
  String = 'string',
  Number = 'number',
  Timestamp = 'timestamp',
  Timestamp_Epoch = 'timestamp_epoch',
  Timestamp_Epoch_Seconds = 'timestamp_epoch_s',
}
export const enum EditorMode {
  Standard = 'standard',
  Global = 'global',
  Variable = 'variable',
}
interface ScrapQuerySources extends SelectableValue<InfinityQuerySources> {
  supported_types: InfinityQueryType[];
}
export interface ScrapColumn {
  selector: string;
  text: string;
  type: ScrapColumnFormat;
}
export interface DataOverride {
  values: string[];
  operator: string;
  override: string;
}
export const enum FilterOperator {
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
    value: InfinityQueryType.CSV,
  },
  {
    label: 'JSON',
    value: InfinityQueryType.JSON,
  },
  {
    label: 'XML',
    value: InfinityQueryType.XML,
  },
  {
    label: 'HTML',
    value: InfinityQueryType.HTML,
  },
  {
    label: 'GraphQL',
    value: InfinityQueryType.GraphQL,
  },
  {
    label: 'Series',
    value: InfinityQueryType.Series,
  },
  {
    label: 'Global Query',
    value: InfinityQueryType.Global,
  },
];
export const SCRAP_QUERY_RESULT_FORMATS: Array<SelectableValue<InfinityQueryFormat>> = [
  {
    label: 'Table',
    value: InfinityQueryFormat.Table,
  },
  {
    label: 'Time Series',
    value: InfinityQueryFormat.TimeSeries,
  },
];
export const SCRAP_QUERY_SOURCES: ScrapQuerySources[] = [
  {
    label: 'URL',
    value: InfinityQuerySources.URL,
    supported_types: [
      InfinityQueryType.CSV,
      InfinityQueryType.JSON,
      InfinityQueryType.HTML,
      InfinityQueryType.XML,
      InfinityQueryType.GraphQL,
    ],
  },
  {
    label: 'Inline',
    value: InfinityQuerySources.Inline,
    supported_types: [InfinityQueryType.CSV, InfinityQueryType.JSON, InfinityQueryType.XML],
  },
  {
    label: 'Random Walk',
    value: InfinityQuerySources.RandomWalk,
    supported_types: [InfinityQueryType.Series],
  },
  {
    label: 'Expression',
    value: InfinityQuerySources.Expression,
    supported_types: [InfinityQueryType.Series],
  },
];
export const SCRAP_QUERY_RESULT_COLUMN_FORMATS: Array<SelectableValue<ScrapColumnFormat>> = [
  {
    label: 'String',
    value: ScrapColumnFormat.String,
  },
  {
    label: 'Number',
    value: ScrapColumnFormat.Number,
  },
  {
    label: 'Timestamp',
    value: ScrapColumnFormat.Timestamp,
  },
  {
    label: 'Timestamp ( UNIX ms )',
    value: ScrapColumnFormat.Timestamp_Epoch,
  },
  {
    label: 'Timestamp ( UNIX s )',
    value: ScrapColumnFormat.Timestamp_Epoch_Seconds,
  },
];
export const enum VariableQueryType {
  Legacy = 'legacy',
  Infinity = 'infinity',
}
export type VariableQuery = {
  queryType: VariableQueryType;
  query: string;
  infinityQuery?: InfinityQuery;
};
