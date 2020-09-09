import { forEach, get } from 'lodash';
import parse from "csv-parse/lib/sync";
import { InfinityQuery, ScrapColumn } from "./../types";

export class CSVParser {
    private rows: any[];
    private series: any[];
    constructor(CSVResponse: string, private target: InfinityQuery, endTime?: Date) {
        this.rows = [];
        this.series = [];
        const options = {
            columns: true,
            skip_empty_lines: true
        };
        const records = parse(CSVResponse, options);
        if (Array.isArray(records)) {
            forEach(records, r => {
                const row: any[] = [];
                target.columns.forEach((c: ScrapColumn) => {
                    row.push(get(r, c.selector, ""));
                });
                this.rows.push(row);
            });
            const NumbersColumns = target.columns.filter(t => t.type === 'number');
            NumbersColumns.forEach((metricColumn: ScrapColumn) => {
                forEach(records, r => {
                    let seriesName = target.columns.filter(t => t.type === 'string').map(c => r[c.selector]).join(' ');
                    if( NumbersColumns.length>1){
                        seriesName += ` ${metricColumn.text}`
                    }
                    const timestamp = endTime ? endTime.getTime() : new Date().getTime();
                    this.series.push({
                        target: seriesName,
                        datapoints: [[get(r, metricColumn.selector), timestamp]]
                    })
                })
            })
        }
    }
    toTable() {
        return {
            rows: this.rows.filter(row => row.length > 0),
            columns: this.target.columns
        }
    }
    toTimeSeries() {
        return this.series
    }
}