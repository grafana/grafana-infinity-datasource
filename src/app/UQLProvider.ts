import { MutableDataFrame, toDataFrame, FieldType, DataFrame } from '@grafana/data';
import { isArray } from 'lodash';
import { uql } from 'uql';
import { toTimeSeriesMany } from './utils';
import type { InfinityQueryFormat } from './../types';

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
        if (res[0] && typeof res[0] === 'string') {
          resolve(
            new MutableDataFrame({
              name: refId || '',
              fields: [
                {
                  name: 'result',
                  type: FieldType.string,
                  values: res,
                },
              ],
            })
          );
        } else if (res[0] && typeof res[0] === 'number') {
          resolve(
            new MutableDataFrame({
              name: refId || '',
              fields: [
                {
                  name: 'result',
                  type: FieldType.number,
                  values: res,
                },
              ],
            })
          );
        } else {
          let frame = toDataFrame(res);
          let newFrame: DataFrame = new MutableDataFrame({
            ...frame,
            fields: frame.fields.map((field) => {
              if (field.type === 'other') {
                return {
                  ...field,
                  values: field.values.toArray().map((v) => JSON.stringify(v)),
                };
              }
              return field;
            }),
          });
          resolve({ ...newFrame, name: frame.name || frame.refId || refId });
        }
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
      .then((r) => {
        resolve(sendAsDataFrame(r, format, refId));
      })
      .catch((ex) => {
        console.error(ex);
        reject('error applying uql query');
      });
  });
};
