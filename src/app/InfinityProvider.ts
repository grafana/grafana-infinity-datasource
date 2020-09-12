import { getBackendSrv } from '@grafana/runtime';
import { InfinityQuery } from '../types';
import { HTMLParser } from './parsers/HTMLParser';
import { JSONParser } from './parsers/JSONParser';
import { CSVParser } from './parsers/CSVParser';

export class InfinityProvider {
    constructor(private target: InfinityQuery) { }
    formatResults(res: any) {
        switch (this.target.type) {
            case "html":
                return (new HTMLParser(res, this.target).getResults());
            case "json":
                return (new JSONParser(res, this.target).getResults());
            case "csv":
                return (new CSVParser(res, this.target).getResults());
            default:
                return undefined;
        }
    }
    query() {
        return new Promise((resolve, reject) => {
            if (this.target.source === 'inline') {
                resolve(this.formatResults(this.target.data));
            } else {
                getBackendSrv().get(this.target.url)
                    .then(res => {
                        resolve(this.formatResults(res));
                    }).catch(ex => {
                        console.error(ex);
                        reject("Failed to retrieve data");
                    });
            }
        })
    }
}
