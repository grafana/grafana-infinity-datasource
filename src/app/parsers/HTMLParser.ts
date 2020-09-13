import { forEach, toNumber } from 'lodash';
import { load } from 'cheerio';
import { InfinityParser } from './InfinityParser';
import { InfinityQuery, ScrapColumn, GrafanaTableRow, GrafanaTableRowItem } from "./../../types";

export class HTMLParser extends InfinityParser {
    constructor(HTMLResponse: string, target: InfinityQuery, endTime?: Date) {
        super(target);
        const rootElements = this.formatInput(HTMLResponse);
        this.constructTableData(rootElements);
        this.constructTimeSeriesData(rootElements, endTime);
    }
    private formatInput(HTMLResponse: string) {
        const $ = load(HTMLResponse);
        const rootElements = $(this.target.root_selector);
        return rootElements;
    }
    private constructTableData(rootElements: Cheerio) {
        forEach(rootElements, r => {
            const row: GrafanaTableRow = [];
            const $ = load(r);
            this.target.columns.forEach((c: ScrapColumn) => {
                let value: GrafanaTableRowItem = $(c.selector).text().trim();
                if (c.type === 'number') {
                    value = value === '' ? null : +value;
                }
                row.push(value);
            });
            this.rows.push(row);
        });
    }
    private constructTimeSeriesData(rootElements: Cheerio, endTime: Date | undefined) {
        this.NumbersColumns.forEach((metricColumn: ScrapColumn) => {
            forEach(rootElements, r => {
                const $$ = load(r);
                let seriesName = this.StringColumns.map(c => $$(c.selector).text()).join(' ');
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
                    timestamp = new Date($$(FirstTimeColumn.selector).text().trim()).getTime();
                }
                if (seriesName) {
                    let metric = toNumber($$(metricColumn.selector).text().trim().replace(/\,/g, ''));
                    this.series.push({
                        target: seriesName,
                        datapoints: [[metric, timestamp]]
                    });
                }
            });
        });
    }
}
