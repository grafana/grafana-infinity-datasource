import { forEach, get } from 'lodash';
import { InfinityQuery, ScrapColumn } from "./../types";

export class JSONParser {
	private rows: any[];
	private series: any[];
	constructor(JSONResponse: object, private target: InfinityQuery, endTime?: Date) {
		this.rows = [];
		this.series = [];
		if (typeof JSONResponse === 'string') {
			JSONResponse = JSON.parse(JSONResponse)
		}
		if (target.root_selector) {
			JSONResponse = get(JSONResponse, target.root_selector);
		}
		if (Array.isArray(JSONResponse)) {
			forEach(JSONResponse, r => {
				const row: any[] = [];
				target.columns.forEach((c: ScrapColumn) => {
					row.push(get(r, c.selector, ""));
				});
				this.rows.push(row);
			});
			const NumbersColumns = target.columns.filter(t => t.type === 'number');
			NumbersColumns.forEach((metricColumn: ScrapColumn) => {
				forEach(JSONResponse, r => {
					let seriesName = target.columns.filter(t => t.type === 'string').map(c => r[c.selector]).join(' ');
					if (NumbersColumns.length > 1) {
						seriesName += ` ${metricColumn.text}`
					}
					const timestamp = endTime ? endTime.getTime() : new Date().getTime();
					this.series.push({
						target: seriesName,
						datapoints: [[get(r, metricColumn.selector), timestamp]]
					})
				})
			})
		} else {
			const row: any[] = [];
			target.columns.forEach((c: ScrapColumn) => {
				row.push(get(JSONResponse, c.selector, ""));
			});
			this.rows.push(row);
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