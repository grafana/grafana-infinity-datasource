import { CSVParser, JSONParser, XMLParser, HTMLParser } from './parsers';
import { InfinityQuery, InfinityQuerySources, InfinityQueryType } from '../types';
import { Datasource } from './../datasource';

export class InfinityProvider {
  constructor(private target: InfinityQuery, private datasource: Datasource) {}
  private async formatResults(res: any) {
    switch (this.target.type) {
      case InfinityQueryType.HTML:
        return new HTMLParser(res, this.target).getResults();
      case InfinityQueryType.JSON:
      case InfinityQueryType.GraphQL:
        return new JSONParser(res, this.target).getResults();
      case InfinityQueryType.XML:
        let xmldata = await new XMLParser(res, this.target);
        return xmldata.getResults();
      case InfinityQueryType.CSV:
        return new CSVParser(res, this.target).getResults();
      default:
        return undefined;
    }
  }
  private proxyResults(query: InfinityQuery) {
    return new Promise((resolve, reject) => {
      this.datasource
        .postResource('/proxy', query)
        .then(res => {
          resolve(res);
        })
        .catch(ex => {
          reject(ex);
        });
    });
  }
  // private getRequestObject(target: InfinityQuery, instanceSettings: InfinityInstanceSettings): BackendSrvRequest {
  //   let requestObject: BackendSrvRequest = {
  //     url: target.url,
  //     method: target.url_options && target.url_options.method ? target.url_options.method : 'GET',
  //   };
  //   if (instanceSettings.jsonData.datasource_mode === DatasourceMode.Advanced) {
  //     const instanceSettingsUrl = instanceSettings.url;
  //     const urlPath = target.url;
  //     requestObject.url = [instanceSettingsUrl, urlPath].join('/');
  //   }
  //   if (target.url_options && target.url_options.method === 'POST') {
  //     requestObject.data = target.url_options.data || '';
  //     if (target.type === InfinityQueryType.GraphQL) {
  //       requestObject.data = JSON.stringify({
  //         query: `${target.url_options.data}`,
  //       });
  //     }
  //   }
  //   return requestObject;
  // }
  private fetchResults() {
    return new Promise((resolve, reject) => {
      this.proxyResults(this.target)
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
