import { forEach, toNumber } from 'lodash';
import { load } from 'cheerio';
import { InfinityQuery, ScrapColumn } from "./../types";

export class HTMLParser {
	private rows: any[];
	private series: any[];
	constructor(HTMLResponse: string, private target: InfinityQuery, endTime?: Date) {
		this.rows = [];
		this.series = [];
		const $ = load(HTMLResponse);
		const rootElements = $(target.root_selector);
		forEach(rootElements, r => {
			const row: any[] = [];
			const $$ = load(r);
			target.columns.forEach((c: ScrapColumn) => {
				row.push($$(c.selector).text().trim());
			});
			this.rows.push(row);
		});
		const NumbersColumns = target.columns.filter(t => t.type === 'number');
		NumbersColumns.forEach((metricColumn: ScrapColumn) => {
			forEach(rootElements, r => {
				const $$ = load(r);
				let seriesName = target.columns.filter(t => t.type === 'string').map(c => $$(c.selector).text()).join(' ');
				if (NumbersColumns.length > 1) {
					seriesName += ` ${metricColumn.text}`;
				}
				const timestamp = endTime ? endTime.getTime() : new Date().getTime();
				if (seriesName) {
					this.series.push({
						target: seriesName,
						datapoints: [[toNumber($$(metricColumn.selector).text().trim().replace(/\,/g, '')), timestamp]]
					});
				}
			});
		});
	}
	toTable() {
		return {
			rows: this.rows.filter(row => row.length > 0),
			columns: this.target.columns
		};
	}
	toTimeSeries() {
		return this.series;
	}
}