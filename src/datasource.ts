import { flatten } from "lodash";
import { DataSourceApi } from '@grafana/data';

export class Datasource extends DataSourceApi {
    constructor(instanceSettings: any) {
        super(instanceSettings)
    }
    testDatasource() {
        return new Promise(async (resolve: any, reject: any) => {
            reject({ message: 'Not Implemented', status: 'error' });
        })
    }
    query(options: any) {
        const promises: any[] = [];
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