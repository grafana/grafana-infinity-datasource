import { isArray, uniq } from 'lodash';
import { InfinityCSVQuery, InfinityGraphQLQuery, InfinityHTMLQuery, InfinityJSONQuery, InfinityQuery, InfinityQueryWithDataSource, InfinityXMLQuery } from './../types';
export const normalizeURL = (url: string): string => {
  if (url.startsWith('https://github.com')) {
    return url
      .replace('https://github.com', 'https://raw.githubusercontent.com')
      .split('/')
      .filter((item, index) => {
        return !(item === 'blob' && index === 5);
      })
      .join('/');
  }
  return url;
};
export const isDataQuery = (query: InfinityQuery): query is InfinityQueryWithDataSource<'csv' | 'json' | 'xml' | 'html' | 'graphql'> => {
  switch (query.type) {
    case 'csv':
    case 'tsv':
    case 'json':
    case 'xml':
    case 'graphql':
    case 'html':
      return true;
    default:
      return false;
  }
};
export const isCSVQuery = (query: InfinityQuery): query is InfinityCSVQuery => query.type === 'csv';
export const isJSONQuery = (query: InfinityQuery): query is InfinityJSONQuery => query.type === 'json';
export const isXMLQuery = (query: InfinityQuery): query is InfinityXMLQuery => query.type === 'xml';
export const isGraphQLQuery = (query: InfinityQuery): query is InfinityGraphQLQuery => query.type === 'graphql';
export const isHTMLQuery = (query: InfinityQuery): query is InfinityHTMLQuery => query.type === 'html';

export const getUniqueFieldNames = (input: unknown): string[] => {
  if (typeof input === 'string') {
    return [input];
  } else if (typeof input === 'number') {
    return [input + ''];
  } else if (typeof input === 'boolean') {
    return [input + ''];
  } else if (typeof input === 'object') {
    if (isArray(input)) {
      let keys: string[] = [];
      input.forEach((i) => {
        Object.keys(i).forEach((k) => keys.push(k));
      });
      return uniq(keys);
    } else {
      return Object.keys(input || {});
    }
  } else {
    return [];
  }
};
export const getFieldsByGroupName = (input: any): Partial<Record<'date_fields' | 'numeric_fields' | 'string_fields', string[]>> => {
  let out: Record<'date_fields' | 'numeric_fields' | 'string_fields', string[]> = {
    date_fields: [],
    numeric_fields: [],
    string_fields: [],
  };
  if (typeof input === 'string' || typeof input === 'number' || typeof input === 'boolean') {
    return {};
  } else if (typeof input === 'object' && input) {
    if (isArray(input)) {
      let keys = getUniqueFieldNames(input);
      keys.forEach((key) => {
        let matchingField = input.find((i) => i[key] !== null && i[key] !== undefined);
        let matchingType = typeof matchingField[key];
        switch (matchingType) {
          case 'number':
            out.numeric_fields.push(key);
            break;
          case 'object':
            if (matchingField[key]?.getDate) {
              out.date_fields.push(key);
            } else {
              out.string_fields.push(key);
            }
            break;
          case 'string':
          default:
            if (matchingField.getDate) {
              out.date_fields.push(key);
            } else {
              out.string_fields.push(key);
            }
            break;
        }
      });
    } else {
      Object.keys(input).forEach((k) => {
        switch (typeof input[k]) {
          case 'number':
            out.numeric_fields.push(k);
            break;
          case 'object':
            if (input[k].getTime) {
              out.date_fields.push(k);
            } else {
              out.string_fields.push(k);
            }
            break;
          case 'string':
          default:
            out.string_fields.push(k);
            break;
        }
      });
    }
  }
  return out;
};
