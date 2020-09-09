import { DataQuery } from '@grafana/data';

export interface ScrapColumn {
    selector: string;
    text: string;
    type: "string" | "number" | "timestamp";
}
export interface InfinityQuery extends DataQuery {
    type: 'json' | 'html' | 'csv';
    source: 'url' | 'inline';
    url: string;
    data: string;
    root_selector: string;
    columns: ScrapColumn[];
    format: 'table' | 'timeseries';
}
export const SCRAP_QUERY_TYPES = [{
    label: 'JSON',
    value: 'json'
}, {
    label: 'HTML',
    value: 'html'
}, {
    label: 'CSV',
    value: 'csv'
}];
export const SCRAP_QUERY_RESULT_FORMATS = [{
    label: 'Table',
    value: 'table'
},{
    label: 'Time Series',
    value: 'timeseries'
}];
export const SCRAP_QUERY_SOURCES = [{
    label: 'URL',
    value: 'url'
},{
    label: 'Inline',
    value: 'inline'
}];
export const SCRAP_QUERY_RESULT_COLUMN_FORMATS = [{
    label: 'String',
    value: 'string'
}, {
    label: 'Number',
    value: 'number'
}, {
    label: 'Timestamp',
    value: 'timestamp'
}];
