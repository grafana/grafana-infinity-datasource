import { uql } from 'uql';
import { isArray } from 'lodash';
import { DataFrame, FieldType, MutableDataFrame, toDataFrame } from '@grafana/data';
import { toTimeSeriesMany } from './utils';
import { InfinityQueryFormat } from '../types';

export const sendAsDataFrame = (res: unknown, format: InfinityQueryFormat = 'table', refId: string): Promise<DataFrame | DataFrame[]> => {
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
        resolve(toTimeSeriesMany([toDataFrame(res)]));
      } else {
        let frame = toDataFrame(res);
        resolve({ ...frame, name: frame.name || refId });
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

export const applyUQL = (query: string, data: unknown, format: InfinityQueryFormat, refId: string): Promise<DataFrame | DataFrame[]> => {
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
