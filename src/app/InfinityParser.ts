import { uniq, flatten } from 'lodash';
import { InfinityQuery, ScrapColumn, GrafanaTableRow, timeSeriesResult } from './../types';

export class InfinityParser {
    rows: GrafanaTableRow[];
    series: timeSeriesResult[];
    StringColumns: ScrapColumn[];
    NumbersColumns: ScrapColumn[];
    TimeColumns: ScrapColumn[];
    constructor(private target: InfinityQuery) {
        this.rows = [];
        this.series = [];
        this.StringColumns = target.columns.filter(t => t.type === 'string');
        this.NumbersColumns = target.columns.filter(t => t.type === 'number');
        this.TimeColumns = target.columns.filter(t => t.type === 'timestamp');
    }
    toTable() {
        return {
            rows: this.rows.filter(row => row.length > 0),
            columns: this.target.columns
        };
    }
    toTimeSeries() {
        const targets = uniq(this.series.map(s => s.target));
        return targets.map(t => {
            return {
                target: t,
                datapoints: flatten(this.series.filter(s => s.target === t).map(s => s.datapoints))
            }
        });
    }
}