import type { SelectableValue } from '@grafana/data';
import type { InfinityQuery, InfinityQueryType, InfinityQueryFormat, InfinityColumnFormat, ScrapQuerySources, VariableQueryType } from './types';

export const DefaultInfinityQuery: InfinityQuery = {
  refId: '',
  type: 'json',
  source: 'url',
  format: 'table',
  url: '',
  url_options: { method: 'GET', data: '' },
  root_selector: '',
  columns: [],
  filters: [],
};

export const SCRAP_QUERY_TYPES: Array<SelectableValue<InfinityQueryType>> = [
  { label: 'JSON', value: 'json' },
  { label: 'CSV', value: 'csv' },
  { label: 'TSV', value: 'tsv' },
  { label: 'GraphQL', value: 'graphql' },
  { label: 'XML', value: 'xml' },
  { label: 'HTML', value: 'html' },
  { label: 'Google Sheets', value: 'google-sheets' },
  { label: 'UQL', value: 'uql' },
  { label: 'GROQ', value: 'groq' },
  { label: 'Series', value: 'series' },
  { label: 'Global Query', value: 'global' },
  { label: 'Transformations', value: 'transformations' },
];
export const INFINITY_RESULT_FORMATS: Array<SelectableValue<InfinityQueryFormat>> = [
  { label: 'Data Frame', value: 'dataframe' },
  { label: 'Table', value: 'table' },
  { label: 'Logs', value: 'logs' },
  { label: 'Traces', value: 'trace' },
  { label: 'Time Series', value: 'timeseries' },
  { label: 'Nodes - Node Graph', value: 'node-graph-nodes' },
  { label: 'Edges - Node Graph', value: 'node-graph-edges' },
  { label: 'As Is', value: 'as-is' },
];
export const INFINITY_SOURCES: ScrapQuerySources[] = [
  { label: 'URL', value: 'url', supported_types: ['csv', 'tsv', 'json', 'html', 'xml', 'graphql', 'uql', 'groq'] },
  { label: 'Inline', value: 'inline', supported_types: ['csv', 'tsv', 'json', 'xml', 'uql', 'groq'] },
  { label: 'Reference', value: 'reference', supported_types: ['csv', 'tsv', 'json', 'xml', 'uql', 'groq'] },
  { label: 'Azure Blob', value: 'azure-blob', supported_types: ['csv', 'tsv', 'json', 'xml', 'uql', 'groq'] },
  { label: 'Random Walk', value: 'random-walk', supported_types: ['series'] },
  { label: 'Expression', value: 'expression', supported_types: ['series'] },
];
export const INFINITY_COLUMN_FORMATS: Array<SelectableValue<InfinityColumnFormat>> = [
  { label: 'String', value: 'string' },
  { label: 'Number', value: 'number' },
  { label: 'Time', value: 'timestamp' },
  { label: 'Time ( UNIX ms )', value: 'timestamp_epoch' },
  { label: 'Time ( UNIX s )', value: 'timestamp_epoch_s' },
  { label: 'Boolean', value: 'boolean' },
];

export const variableQueryTypes: Array<SelectableValue<VariableQueryType>> = [
  {
    label: 'Infinity',
    value: 'infinity',
  },
  {
    label: 'Legacy',
    value: 'legacy',
  },
  {
    label: 'Random String',
    value: 'random',
  },
];

export const IGNORE_URL = '__IGNORE_URL__';
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

export const AWSRegions: Array<SelectableValue<string>> = [
  'af-south-1',
  'ap-east-1',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-northeast-3',
  'ap-south-1',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-southeast-3',
  'ca-central-1',
  'cn-north-1',
  'cn-northwest-1',
  'eu-central-1',
  'eu-north-1',
  'eu-south-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'me-south-1',
  'sa-east-1',
  'us-east-1',
  'us-east-2',
  'us-gov-east-1',
  'us-gov-west-1',
  'us-iso-east-1',
  'us-west-1',
  'us-west-2',
].map((value) => ({ value, label: value }));
