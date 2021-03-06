import { BackendSrvImpl, DataSourceInstanceSettings, logger } from '@grafana/tsbackend'
import { BackendSrvRequest } from '@grafana/runtime';
import { InfinityQuery, DatasourceMode, InfinityOptions } from '../../shared/types';
import { HTMLParser } from './parsers/HTMLParser';
import { JSONParser } from './parsers/JSONParser';
import { CSVParser } from './parsers/CSVParser';

export class InfinityProvider {
  backendSrv: BackendSrvImpl;
  constructor(private target: InfinityQuery, private instanceSettings: DataSourceInstanceSettings<InfinityOptions>) {
    this.backendSrv = new BackendSrvImpl(instanceSettings)
  }
  formatResults(res: any) {
    switch (this.target.type) {
      case 'html':
        return new HTMLParser(res, this.target).getResults();
      case 'json':
      case 'graphql':
        return new JSONParser(res, this.target).getResults();
      case 'csv':
        return new CSVParser(res, this.target).getResults();
      default:
        return undefined;
    }
  }
  fetchResults() {
    return new Promise((resolve, reject) => {
      let requestObject: BackendSrvRequest = {
        url: this.target.url,
        method: this.target.url_options && this.target.url_options.method ? this.target.url_options.method : 'GET',
      };
      if (this.instanceSettings.json.datasource_mode === DatasourceMode.Advanced) {
        const instanceSettingsUrl = this.instanceSettings.url;
        const urlPath = this.target.url;
        requestObject.url = [instanceSettingsUrl, urlPath].join('/');
      }
      if (this.target.url_options && this.target.url_options.method === 'POST') {
        requestObject.data = this.target.url_options.data || '';
        if (this.target.type === 'graphql') {
          requestObject.data = JSON.stringify({
            query: `${this.target.url_options.data}`,
          });
        }
      }
      this.backendSrv
        .datasourceRequest(requestObject)
        .then(res => {
          logger.debug("We got a response!!!!!!!!", res);
          resolve(res.data);
        })
        .catch(ex => {
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
