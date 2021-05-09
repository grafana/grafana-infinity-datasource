import { CSVParser, JSONParser, XMLParser, HTMLParser } from './parsers';
import { InfinityQuery, InfinityQuerySources, InfinityQueryType } from '../types';
import { Datasource } from './../datasource';
import { getTemplateSrv } from '@grafana/runtime';

export class InfinityProvider {
  constructor(private target: InfinityQuery, private datasource: Datasource) {}
  private async formatResults(res: any) {
    const query = this.target;
    query.root_selector = getTemplateSrv().replace(query.root_selector);
    switch (this.target.type) {
      case InfinityQueryType.HTML:
        return new HTMLParser(res, query).getResults();
      case InfinityQueryType.JSON:
      case InfinityQueryType.GraphQL:
        return new JSONParser(res, query).getResults();
      case InfinityQueryType.XML:
        let xmlData = await new XMLParser(res, query);
        return xmlData.getResults();
      case InfinityQueryType.CSV:
        return new CSVParser(res, query).getResults();
      default:
        return undefined;
    }
  }
  private fetchResults() {
    return new Promise((resolve, reject) => {
      this.datasource
        .postResource('/proxy', this.target)
        .then(res => {
          resolve(res);
        })
        .catch(ex => {
          reject(ex);
        });
    });
  }
  query() {
    return new Promise((resolve, reject) => {
      if (this.target.source === InfinityQuerySources.Inline) {
        resolve(this.formatResults(this.target.data));
      } else {
        this.fetchResults()
          .then(res => {
            resolve(this.formatResults(res));
          })
          .catch(ex => {
            reject(ex);
          });
      }
    });
  }
}
