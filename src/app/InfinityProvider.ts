import { getBackendSrv, BackendSrvRequest } from '@grafana/runtime';
import { CSVParser, JSONParser, XMLParser, HTMLParser } from './parsers';
import {
  DatasourceMode,
  InfinityInstanceSettings,
  InfinityQuery,
  InfinityQuerySources,
  InfinityQueryType,
} from '../types';

export class InfinityProvider {
  constructor(private target: InfinityQuery, private instanceSettings: InfinityInstanceSettings) {}
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
  private getRequestObject(target: InfinityQuery, instanceSettings: InfinityInstanceSettings): BackendSrvRequest {
    let requestObject: BackendSrvRequest = {
      url: target.url,
      method: target.url_options && target.url_options.method ? target.url_options.method : 'GET',
    };
    if (instanceSettings.jsonData.datasource_mode === DatasourceMode.Advanced) {
      const instanceSettingsUrl = instanceSettings.url;
      const urlPath = target.url;
      requestObject.url = [instanceSettingsUrl, urlPath].join('/');
    }
    if (instanceSettings.jsonData.datasource_mode === DatasourceMode.TokenAuth) {
      const instanceSettingsUrl = instanceSettings.url;
      requestObject.url = [instanceSettingsUrl, 'tokenauth', target.url].join('/');
    }
    if (target.url_options && target.url_options.method === 'POST') {
      requestObject.data = target.url_options.data || '';
      if (target.type === InfinityQueryType.GraphQL) {
        requestObject.data = JSON.stringify({
          query: `${target.url_options.data}`,
        });
      }
    }
    return requestObject;
  }
  private fetchResults() {
    return new Promise((resolve, reject) => {
      let requestObject = this.getRequestObject(this.target, this.instanceSettings);
      if (requestObject.url) {
        getBackendSrv()
          .datasourceRequest(requestObject)
          .then(res => {
            resolve(res.data);
          })
          .catch(ex => {
            reject(ex);
          });
      } else {
        reject('Invalid URL');
      }
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
