import { flatten } from 'lodash';
import { DataSourceApi} from '@grafana/data';
import { InfinityProvider } from './app/InfinityProvider';
import { SeriesProvider } from './app/SeriesProvider';
import { replaceVariables } from './utils';
import { InfinityQuery } from './types';

export class Datasource extends DataSourceApi<InfinityQuery> {
    constructor(private instanceSettings: any) {
        super(instanceSettings);
    }
    testDatasource() {
        return new Promise(async (resolve: any, reject: any) => {
            if (this.instanceSettings.jsonData && this.instanceSettings.jsonData.datasource_mode && this.instanceSettings.jsonData.datasource_mode === 'basic') {
                resolve({ message: 'No checks required', status: 'success' });
            } else {
                if (this.instanceSettings.url) {
                    resolve({ message: 'No checks performed', status: 'success' });
                } else {
                    reject({ message: 'Missing URL', status: 'error' });
                }
            }
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
                    case "graphql":
                        new InfinityProvider(replaceVariables(t, options.scopedVars), this.instanceSettings).query()
                            .then(res => resolve(res))
                            .catch(ex => {
                                reject(ex);
                            })
                        break;
                    case "series":
                        new SeriesProvider(replaceVariables(t, options.scopedVars)).query(options.range.from, options.range.to)
                            .then(res => resolve(res))
                            .catch(ex => {
                                reject(ex);
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
