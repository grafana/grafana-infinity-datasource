import { flatten } from 'lodash';
import { DataSourceApi } from '@grafana/data';
import { InfinityProvider } from './app/InfinityProvider';
import { InfinityQuery } from './types';
import { SeriesProvider } from './app/SeriesProvider';

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
        options.targets.filter((t: InfinityQuery) => t.hide !== true).forEach((t: InfinityQuery) => {
            promises.push(new Promise((resolve, reject) => {
                switch (t.type) {
                    case "csv":
                    case "html":
                    case "json":
                        new InfinityProvider(t).query()
                            .then(res => resolve(res))
                            .catch(ex => {
                                console.error(ex);
                                reject("Failed to retrieve data");
                            })
                        break;
                    case "series":
                        new SeriesProvider(t).query(options.range.from, options.range.to)
                            .then(res => resolve(res))
                            .catch(ex => {
                                console.error(ex);
                                reject("Failed to retrieve data");
                            })
                        break;
                    default:
                        reject("Unknown Query Type");
                        break;
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
