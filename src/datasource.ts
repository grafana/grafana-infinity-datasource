import { flatten, forEach, get } from "lodash";
import { DataSourceApi } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { load } from 'cheerio';
import { InfinityQuery } from "./types";
import parse from "csv-parse/lib/sync";

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
        options.targets.forEach((t: any) => {
            promises.push(new Promise((resolve, reject) => {
                getBackendSrv().get(t.url)
                    .then(res => {
                        const rows: any[] = [];
                        if (t.type === "html") {
                            const $ = load(res);
                            const rootElements = $(t.root_selector);
                            forEach(rootElements, r => {
                                const row: any[] = [];
                                const $$ = load(r);
                                t.columns.forEach((c: any) => {
                                    row.push($$(c.selector).text().trim());
                                });
                                rows.push(row);
                            });
                        } else if (t.type === "json") {
                            if (t.root_selector) {
                                res = get(res, t.root_selector);
                            }
                            if (Array.isArray(res)) {
                                forEach(res, r => {
                                    const row: any[] = [];
                                    t.columns.forEach((c: any) => {
                                        row.push(get(r, c.selector, ""));
                                    });
                                    rows.push(row);
                                });
                            } else {
                                const row: any[] = [];
                                t.columns.forEach((c: any) => {
                                    row.push(get(res, c.selector, ""));
                                });
                                rows.push(row);
                            }
                        } else if (t.type === "csv") {
                            const options = {
                                columns: true,
                                skip_empty_lines: true
                            };
                            const records = parse(res, options);
                            if (Array.isArray(records)) {
                                forEach(records, r => {
                                    const row: any[] = [];
                                    t.columns.forEach((c: any) => {
                                        row.push(get(r, c.selector, ""));
                                    });
                                    rows.push(row);
                                });
                            }
                        }
                        resolve({
                            rows,
                            columns: t.columns
                        });
                    }).catch(ex => {
                        reject("Failed to retrieve data");
                    });
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
