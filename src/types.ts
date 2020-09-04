import { DataQuery } from '@grafana/data';

export interface ScrapColumn {
    selector: string;
    text: string;
    type: "string";
}
export interface ScrapQuery extends DataQuery {
    type: 'json' | 'html';
    format: 'table' | 'timeseries';
    url: string;
    root_selector: string;
    columns: ScrapColumn[];
}
export const SCRAP_QUERY_TYPES = [{
    label: 'JSON',
    value: 'json'
}, {
    label: 'HTML',
    value: 'html'
}]
export const SCRAP_QUERY_RESULT_FORMATS = [{
    label: 'Table',
    value: 'table'
}]
export const SCRAP_QUERY_RESULT_COLUMN_FORMATS = [{
    label: 'String',
    value: 'string'
}]