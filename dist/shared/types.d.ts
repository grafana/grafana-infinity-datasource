import { DataQuery } from '@grafana/data';
export declare type dataPoint = [number | null, number];
export declare type timeSeriesResult = {
    target: string;
    datapoints: dataPoint[];
};
export declare type GrafanaTableColumn = {
    text: string;
    type: string;
};
export declare type GrafanaTableRowItem = string | number | object | null;
export declare type GrafanaTableRow = GrafanaTableRowItem[];
export declare type tableResult = {
    columns: GrafanaTableColumn[];
    rows: GrafanaTableRow;
};
export declare type queryResult = timeSeriesResult | tableResult;
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
export declare const SCRAP_QUERY_TYPES: {
    label: string;
    value: string;
}[];
export declare const SCRAP_QUERY_RESULT_FORMATS: {
    label: string;
    value: string;
}[];
export declare const SCRAP_QUERY_SOURCES: {
    label: string;
    value: string;
    supported_types: string[];
}[];
export declare const SCRAP_QUERY_RESULT_COLUMN_FORMATS: {
    label: string;
    value: string;
}[];
