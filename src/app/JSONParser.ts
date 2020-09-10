import { forEach, get } from 'lodash';
import { InfinityQuery, ScrapColumn, GrafanaTableRow } from "./../types";
import { InfinityParser } from './InfinityParser';

export class JSONParser extends InfinityParser {
    constructor(JSONResponse: object, target: InfinityQuery, endTime?: Date) {
        super(target);
        if (typeof JSONResponse === 'string') {
            JSONResponse = JSON.parse(JSONResponse)
        }
        if (target.root_selector) {
            JSONResponse = get(JSONResponse, target.root_selector);
        }
        if (Array.isArray(JSONResponse)) {
            forEach(JSONResponse, r => {
                const row: GrafanaTableRow = [];
                target.columns.forEach((c: ScrapColumn) => {
                    row.push(get(r, c.selector, ""));
                });
                this.rows.push(row);
            });
            this.NumbersColumns.forEach((metricColumn: ScrapColumn) => {
                forEach(JSONResponse, r => {
                    let seriesName = this.StringColumns.map(c => r[c.selector]).join(' ');
                    if (this.NumbersColumns.length > 1) {
                        seriesName += ` ${metricColumn.text}`;
                    }
                    if (this.NumbersColumns.length === 1 && seriesName === '') {
                        seriesName = `${metricColumn.text}`;
                    }
                    seriesName = seriesName.trim();
                    let timestamp = endTime ? endTime.getTime() : new Date().getTime();
                    if (this.TimeColumns.length >= 1) {
                        const FirstTimeColumn = this.TimeColumns[0];
                        timestamp = new Date(get(r, FirstTimeColumn.selector)).getTime();
                    }
                    this.series.push({
                        target: seriesName,
                        datapoints: [[get(r, metricColumn.selector), timestamp]]
                    })
                })
            })
        } else {
            const row: GrafanaTableRow = [];
            target.columns.forEach((c: ScrapColumn) => {
                row.push(get(JSONResponse, c.selector, ""));
            });
            this.rows.push(row);
        }
    }
}