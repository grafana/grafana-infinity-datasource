import { flatten } from "lodash";
import { DataSourceApi } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { InfinityQuery } from "./types";
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
        options.targets.forEach((t: any) => {
            promises.push(new Promise((resolve, reject) => {
                getBackendSrv().get(t.url)
                    .then(res => {
                        if (t.type === "html") {
                            const htmlResults = new HTMLParser(res, t);
                            resolve(htmlResults.toTable());
                        } else if (t.type === "json") {
                            const jsonResults = new JSONParser(res, t);
                            resolve(jsonResults.toTable());
                        } else if (t.type === "csv") {
                            const csvResults = new CSVParser(res, t);
                            resolve(csvResults.toTable());
                        }
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
