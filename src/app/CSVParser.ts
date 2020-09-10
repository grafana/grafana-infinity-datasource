import { forEach, get, toNumber } from 'lodash';
import parse from "csv-parse/lib/sync";
import { InfinityQuery, ScrapColumn, GrafanaTableRow } from "./../types";
import { InfinityParser } from './InfinityParser';

export class CSVParser extends InfinityParser {
    constructor(CSVResponse: string, target: InfinityQuery, endTime?: Date) {
        super(target);
        const options = {
            columns: true,
            skip_empty_lines: true
        };
        const records = parse(CSVResponse, options);
        if (Array.isArray(records)) {
            forEach(records, r => {
                const row: GrafanaTableRow = [];
                target.columns.forEach((c: ScrapColumn) => {
                    row.push(get(r, c.selector, ""));
                });
                this.rows.push(row);
            });
            this.NumbersColumns.forEach((metricColumn: ScrapColumn) => {
                forEach(records, r => {
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
                        datapoints: [[toNumber(get(r, metricColumn.selector)), timestamp]]
                    });
                });
            });
        }
    }
}
