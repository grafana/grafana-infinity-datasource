import { uql } from 'uql';
import { isArray } from 'lodash';
import { DataFrame, FieldType, MutableDataFrame, toDataFrame } from '@grafana/data';
import { Datasource } from './../datasource';
import { normalizeURL } from './utils';
import { InfinityQueryFormat, InfinityUQLQuery } from '../types';

export class UQLProvider {
  constructor(private target: InfinityUQLQuery, private datasource: Datasource) {}
  private fetchResults() {
    return new Promise((resolve, reject) => {
      if (this.target.source === 'url') {
        const target = this.target;
        target.url = normalizeURL(target.url);
        this.datasource.postResource('proxy', target).then(resolve).catch(reject);
      } else if (this.target.source === 'inline') {
        resolve(this.target.data);
      } else {
        reject('invalid query type');
      }
    });
  }
  query() {
    return new Promise((resolve, reject) => {
      this.fetchResults().then(resolve).catch(reject);
    });
  }
}

const sendAsDataFrame = (res: unknown, format: InfinityQueryFormat = 'table', refId: string): Promise<DataFrame> => {
  return new Promise((resolve, reject) => {
    if (typeof res === 'number') {
      let result = new MutableDataFrame({
        name: refId || 'result',
        length: 1,
        fields: [
          {
            name: 'result',
            type: FieldType.number,
            values: [res],
          },
        ],
      });
      resolve(result);
    } else if (typeof res === 'string') {
      let result = new MutableDataFrame({
        name: 'result',
        length: 1,
        fields: [
          {
            name: 'result',
            type: FieldType.string,
            values: [res],
          },
        ],
      });
      resolve(result);
    } else if (typeof res === 'object' && isArray(res)) {
      if (format === 'timeseries') {
        resolve(toDataFrame(res)); // TODO: convert to multi frame results
      } else {
        resolve(toDataFrame(res));
      }
    } else {
      resolve(
        new MutableDataFrame({
          name: refId || 'result',
          length: 1,
          fields: [
            {
              name: 'result',
              type: FieldType.string,
              values: [JSON.stringify(res, null, 4)],
            },
          ],
        })
      );
    }
  });
};

export const applyUQL = (query: string, data: unknown, format: InfinityQueryFormat, refId: string): Promise<DataFrame> => {
  if (!query) {
    return sendAsDataFrame(data, format, refId);
  }
  return new Promise((resolve, reject) => {
    if ((query + '').trim() === '') {
      resolve(sendAsDataFrame(data, format, refId));
    }
    let input = data;
    uql(query, { data: input })
      .then((r) => resolve(sendAsDataFrame(r, format, refId)))
      .catch((ex) => {
        console.error(ex);
        reject('error applying uql query');
      });
  });
};
