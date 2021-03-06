"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCRAP_QUERY_RESULT_COLUMN_FORMATS = exports.SCRAP_QUERY_SOURCES = exports.SCRAP_QUERY_RESULT_FORMATS = exports.SCRAP_QUERY_TYPES = exports.DatasourceMode = void 0;
var DatasourceMode;
(function (DatasourceMode) {
    DatasourceMode["Basic"] = "basic";
    DatasourceMode["Advanced"] = "advanced";
})(DatasourceMode = exports.DatasourceMode || (exports.DatasourceMode = {}));
exports.SCRAP_QUERY_TYPES = [
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
exports.SCRAP_QUERY_RESULT_FORMATS = [
    {
        label: 'Table',
        value: 'table',
    },
    {
        label: 'Time Series',
        value: 'timeseries',
    },
];
exports.SCRAP_QUERY_SOURCES = [
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
exports.SCRAP_QUERY_RESULT_COLUMN_FORMATS = [
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
//# sourceMappingURL=types.js.map