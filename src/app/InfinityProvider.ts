import { getTemplateSrv } from '@grafana/runtime';
import { Datasource } from './../datasource';
import { CSVParser, HTMLParser, JSONParser, XMLParser } from './parsers';
import type { InfinityDataQuery } from './../types';

export class InfinityProvider {
  constructor(
    private target: InfinityDataQuery,
    private datasource: Datasource
  ) {}
  async formatResults(res: any) {
    const query = this.target;
    query.root_selector = getTemplateSrv().replace(query.root_selector);
    switch (query.type) {
      case 'html':
        return new HTMLParser(res, query).getResults();
      case 'json':
      case 'graphql':
        if (query.format === 'as-is' && query.source === 'url') {
          if (typeof res === 'object') {
            return res;
          } else if (typeof res === 'string') {
            const data = JSON.parse(res || '[]');
            return data;
          } else {
            return res;
          }
        } else if (query.format === 'as-is' && query.source === 'inline') {
          const data = JSON.parse(query.data || '[]');
          return data;
        }
        return new JSONParser(res, query).getResults();
      case 'xml':
        // eslint-disable-next-line no-case-declarations
        let xmlData = await new XMLParser(res, query);
        return xmlData.getResults();
      case 'csv':
      case 'tsv':
        return new CSVParser(res, query).getResults();
      default:
        return undefined;
    }
  }
  private fetchResults() {
    return new Promise((resolve, reject) => {
      if (this.target.source === 'url') {
        const target = this.target;
        this.datasource
          .postResource('proxy', target)
          .then((res) => {
            resolve(res);
          })
          .catch((ex) => {
            reject(ex);
          });
      } else {
        reject('invalid query type');
      }
    });
  }
  query() {
    return new Promise((resolve, reject) => {
      if (this.target.source === 'inline') {
        resolve(this.formatResults(this.target.data));
      } else {
        this.fetchResults()
          .then((res) => resolve(this.formatResults(res)))
          .catch(reject);
      }
    });
  }
}
