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
            case "graphql":
                return (new JSONParser(res, this.target).getResults());
            case "csv":
                return (new CSVParser(res, this.target).getResults());
            default:
                return undefined;
        }
    }
    fetchResults() {
        return new Promise((resolve, reject) => {
            if (this.target.url_options && this.target.url_options.method === 'POST') {
                let body = this.target.url_options.data || '';
                if (this.target.type === 'graphql') {
                    body = JSON.stringify({
                        query: `${this.target.url_options.data}`
                    });
                }
                getBackendSrv().post(this.target.url, body).then(resolve);
            } else {
                getBackendSrv().get(this.target.url).then(resolve);
            }
        })
    }
    query() {
        return new Promise((resolve, reject) => {
            if (this.target.source === 'inline') {
                resolve(this.formatResults(this.target.data));
            } else {
                this.fetchResults()
                    .then(res => {
                        resolve(this.formatResults(res));
                    }).catch(ex => {
                        reject(ex);
                    });
            }
        })
    }
}
