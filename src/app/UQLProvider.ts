import { uql } from 'uql';
import { isArray } from 'lodash';
import { DataFrame, FieldType, MutableDataFrame, toDataFrame } from '@grafana/data';
import { Datasource } from './../datasource';
import { normalizeURL } from './utils';
import { InfinityUQLQuery } from '../types';

export class UQLProvider {
  constructor(private target: InfinityUQLQuery, private datasource: Datasource) {}
  private fetchResults() {
    return new Promise((resolve, reject) => {
      if (this.target.source === 'url') {
        const target = this.target;
        target.url = normalizeURL(target.url);
        this.datasource.postResource('proxy', target).then(resolve).catch(reject);
      } else {
        reject('invalid query type');
      }
    });
  }
  query() {
    return new Promise((resolve, reject) => {
      if (this.target.source === 'inline') {
        resolve(this.target.data);
      } else {
        this.fetchResults().then(resolve).catch(reject);
      }
    });
  }
}

const sendAsDataFrame = (res: unknown): Promise<DataFrame> => {
  return new Promise((resolve, reject) => {
    if (typeof res === 'number') {
      let result = new MutableDataFrame({
        name: 'result',
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
      resolve(toDataFrame(res));
    } else {
      resolve(
        new MutableDataFrame({
          name: 'result',
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

export const applyUQL = (query: string, data: unknown): Promise<DataFrame> => {
  if (!query) {
    return sendAsDataFrame(data);
  }
  return new Promise((resolve, reject) => {
    let input = data;
    uql(query, { data: input })
      .then((r) => resolve(sendAsDataFrame(r)))
      .catch((ex) => {
        console.error(ex);
        reject('error applying uql query');
      });
  });
};
