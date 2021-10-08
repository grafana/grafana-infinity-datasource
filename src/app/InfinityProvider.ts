import { getTemplateSrv } from '@grafana/runtime';
import { CSVParser, JSONParser, XMLParser, HTMLParser } from './parsers';
import { InfinityQuery } from '../types';
import { Datasource } from './../datasource';
import { normalizeURL } from './utils';

export class InfinityProvider {
  constructor(private target: InfinityQuery, private datasource: Datasource) {}
  private async formatResults(res: any) {
    const query = this.target;
    query.root_selector = getTemplateSrv().replace(query.root_selector);
    switch (this.target.type) {
      case 'html':
        return new HTMLParser(res, query).getResults();
      case 'json':
      case 'graphql':
        return new JSONParser(res, query).getResults();
      case 'xml':
        let xmlData = await new XMLParser(res, query);
        return xmlData.getResults();
      case 'csv':
        return new CSVParser(res, query).getResults();
      default:
        return undefined;
    }
  }
  private fetchResults() {
    return new Promise((resolve, reject) => {
      const target = this.target;
      target.url = normalizeURL(target.url);
      this.datasource
        .postResource('proxy', target)
        .then((res) => {
          resolve(res);
        })
        .catch((ex) => {
          reject(ex);
        });
    });
  }
  query() {
    return new Promise((resolve, reject) => {
      if (this.target.source === 'inline') {
        resolve(this.formatResults(this.target.data));
      } else {
        this.fetchResults()
          .then((res) => {
            resolve(this.formatResults(res));
          })
          .catch((ex) => {
            reject(ex);
          });
      }
    });
  }
}
