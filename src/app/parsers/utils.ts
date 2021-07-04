import { get, set } from 'lodash';
import { ScrapColumn, ScrapColumnFormat } from './../../types';

const guessColumnTypeFromField = (obj: any): ScrapColumnFormat => {
  switch (typeof obj) {
    case 'number':
      return ScrapColumnFormat.Number;
    case 'string':
    default:
      return ScrapColumnFormat.String;
  }
};

export const getColumnsFromObjectArray = (result: any): ScrapColumn[] => {
  if (result) {
    return Object.keys(result).map((key) => {
      return { selector: key, text: key, type: guessColumnTypeFromField(result[key]) };
    });
  } else {
    return [];
  }
};

export const normalizeColumns = (columns: ScrapColumn[]): ScrapColumn[] => {
  return [...columns].map((c) => {
    c.text = c.text || c.selector;
    return c;
  });
};

export const columnarToTable = (response: any, columns: ScrapColumn[] = []) => {
  let res: any[] = [];
  columns =
    columns.length > 0
      ? columns
      : Object.keys(response).map((k) => {
          return {
            selector: k,
            text: k,
            type: ScrapColumnFormat.String,
          };
        });
  let len = get(response, columns[0].selector).length;
  for (let i = 0; i < len; i++) {
    let o: Record<string, any> = {};
    columns.forEach((column) => {
      let values_array = get(response, column.selector);
      let value = values_array && values_array.length > 0 ? values_array[i] : null;
      set(o, column.selector, value);
    });
    res.push(o);
  }
  return res;
};
