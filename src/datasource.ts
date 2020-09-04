import { flatten, forEach, get } from "lodash";
import { DataSourceApi } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { load } from 'cheerio';

export class Datasource extends DataSourceApi {
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
                t = {
                    type: "html",
                    format: "table",
                    url: "https://grafana.com/about/team/",
                    root_selector: `body > div.main > div.page__content > div > div > div:nth-child(3) > div > div`,
                    columns: [
                        {
                            selector: `h4`,
                            text: `Member`,
                            type: `string`
                        },
                        {
                            selector: `.team__title`,
                            text: `Title`,
                            type: `string`
                        }
                    ]
                };
                t = {
                    type: "json",
                    url: "https://jsonplaceholder.typicode.com/users",
                    root_selector: "",
                    columns: [
                        {
                            selector: 'name',
                            text: `Name`,
                            type: `string`
                        },
                        {
                            selector: 'email',
                            text: `Email`,
                            type: `string`
                        },
                        {
                            selector: 'company.name',
                            text: `Company Name`,
                            type: `string`
                        }
                    ]
                }
                t = {
                    type: "json",
                    url: "https://localhost:3333/api/dashboards/uid/4pRYL2DMk",
                    root_selector: "dashboard.panels",
                    columns: [
                        {
                            selector: 'title',
                            text: `Title`,
                            type: `string`
                        },
                        {
                            selector: 'type',
                            text: `Type`,
                            type: `string`
                        },
                        {
                            selector: 'datasource',
                            text: `Data Source`,
                            type: `string`
                        }
                    ]
                }
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
                                res = get(res, t.root_selector)
                            }
                            forEach(res, r => {
                                const row: any[] = [];
                                t.columns.forEach((c: any) => {
                                    row.push(get(r, c.selector, ""));
                                });
                                rows.push(row);
                            })
                        }
                        resolve({
                            rows,
                            columns: t.columns
                        });
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
