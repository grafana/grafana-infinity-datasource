import { flatten } from 'lodash';
import { DataSourceApi } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { InfinityQuery } from './types';
import { HTMLParser } from './app/HTMLParser';
import { JSONParser } from './app/JSONParser';
import { CSVParser } from './app/CSVParser';

export class Datasource extends DataSourceApi<InfinityQuery> {
	constructor(instanceSettings: any) {
		super(instanceSettings);
	}
	testDatasource() {
		return new Promise(async (resolve: any, reject: any) => {
			reject({ message: 'Not Implemented', status: 'error' });
		});
	}
	query(options: any) {
		const promises: any[] = [];
		options.targets.forEach((t: InfinityQuery) => {
			promises.push(new Promise((resolve, reject) => {
				if (t.source === 'inline') {
					if (t.type === "html") {
						const htmlResults = new HTMLParser(t.data, t);
						if (t.format === 'table') {
							resolve(htmlResults.toTable());
						} else {
							resolve(htmlResults.toTimeSeries());
						}
					} else if (t.type === "json") {
						const jsonResults = new JSONParser(JSON.parse(t.data), t, new Date(options.range.to));
						if (t.format === 'table') {
							resolve(jsonResults.toTable());
						} else {
							resolve(jsonResults.toTimeSeries());
						}
					} else if (t.type === "csv") {
						const csvResults = new CSVParser(t.data, t);
						if (t.format === 'table') {
							resolve(csvResults.toTable());
						} else {
							resolve(csvResults.toTimeSeries());
						}
					}
				} else {
					getBackendSrv().get(t.url)
						.then(res => {
							if (t.type === "html") {
								const htmlResults = new HTMLParser(res, t);
								if (t.format === 'table') {
									resolve(htmlResults.toTable());
								} else {
									resolve(htmlResults.toTimeSeries());
								}
							} else if (t.type === "json") {
								const jsonResults = new JSONParser(res, t);
								if (t.format === 'table') {
									resolve(jsonResults.toTable());
								} else {
									resolve(jsonResults.toTimeSeries());
								}
							} else if (t.type === "csv") {
								const csvResults = new CSVParser(res, t);
								if (t.format === 'table') {
									resolve(csvResults.toTable());
								} else {
									resolve(csvResults.toTimeSeries());
								}
							}
						}).catch(ex => {
							reject("Failed to retrieve data");
						});

				}
			}));
		});
		return Promise.all(promises).then(results => {
			return { data: flatten(results) };
		});
	}
	annotationQuery(options: any) {
		const promises: any[] = [];
		return Promise.all(promises).then(results => {
			return [];
		});
	}
	metricFindQuery(query: string) {
		const promises: any[] = [];
		return Promise.all(promises).then(results => {
			return [];
		});
	}
}
