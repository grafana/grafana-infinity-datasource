import { get, isArray, set } from 'lodash';
import type { InfinityColumn, InfinityColumnFormat } from './../../types';

const guessColumnTypeFromField = (obj: any): InfinityColumnFormat => {
  switch (typeof obj) {
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'string':
    default:
      return 'string';
  }
};

export const getColumnsFromObjectArray = (result: any): InfinityColumn[] => {
  if (result) {
    return Object.keys(result).map((key) => {
      return { selector: key, text: key, type: guessColumnTypeFromField(result[key]) };
    });
  } else {
    return [];
  }
};

export const normalizeColumns = (columns: InfinityColumn[] = []): InfinityColumn[] => {
  return [...columns].map((c) => {
    return { ...c, text: c.text || c.selector };
  });
};

export const columnarToTable = (response: any, columns: InfinityColumn[] = []) => {
  let res: any[] = [];
  columns =
    columns.length > 0
      ? columns
      : Object.keys(response).map((k) => {
          return {
            selector: k,
            text: k,
            type: 'string',
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

export const getValue = (input: string | boolean | number | Date | null, type: InfinityColumnFormat, asTimestamp?: boolean) => {
  switch (type) {
    case 'string':
      if (typeof input === 'number') {
        return input + '';
      }
      return input;
    case 'boolean':
      if (typeof input === 'boolean') {
        return input;
      }
      if (typeof input === 'number') {
        return input > 0;
      }
      if (typeof input === 'string') {
        return (input + '').toLowerCase() === 'true';
      }
      return Boolean(!!input);
    case 'number':
      if (typeof input === 'number') {
        return input;
      } else if (typeof input === 'string' && input) {
        let val = parseFloat((input + '').trim().replace(/,/g, ''));
        return Number.isFinite(val) ? val : null;
      } else if (typeof input === 'object' && isArray(input) && input.length > 0) {
        let val = parseFloat((input[0] + '').trim().replace(/,/g, ''));
        return Number.isFinite(val) ? val : null;
      } else {
        return null;
      }
    case 'timestamp':
      return asTimestamp ? new Date(input + '').getTime() : new Date(input + '');
    case 'timestamp_epoch':
      if (typeof input === 'string') {
        return asTimestamp ? new Date(parseInt(input, 10)).getTime() : new Date(parseInt(input, 10));
      } else if (typeof input === 'number') {
        return asTimestamp ? new Date(input).getTime() : new Date(input);
      } else {
        return null;
      }
    case 'timestamp_epoch_s':
      if (typeof input === 'string') {
        return asTimestamp ? new Date(parseInt(input, 10) * 1000).getTime() : new Date(parseInt(input, 10) * 1000);
      } else if (typeof input === 'number') {
        return asTimestamp ? new Date(input * 1000).getTime() : new Date(input * 1000);
      } else {
        return null;
      }
    default:
      return input;
  }
};
