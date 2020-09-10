import { forEach, toNumber } from 'lodash';
import { load } from 'cheerio';
import { InfinityQuery, ScrapColumn, GrafanaTableRow } from "./../types";
import { InfinityParser } from './InfinityParser';

export class HTMLParser extends InfinityParser {
    constructor(HTMLResponse: string, target: InfinityQuery, endTime?: Date) {
        super(target);
        const $ = load(HTMLResponse);
        const rootElements = $(target.root_selector);
        forEach(rootElements, r => {
            const row: GrafanaTableRow = [];
            const $$ = load(r);
            target.columns.forEach((c: ScrapColumn) => {
                row.push($$(c.selector).text().trim());
            });
            this.rows.push(row);
        });
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
                    this.series.push({
                        target: seriesName,
                        datapoints: [[toNumber($$(metricColumn.selector).text().trim().replace(/\,/g, '')), timestamp]]
                    });
                }
            });
        });
    }
}