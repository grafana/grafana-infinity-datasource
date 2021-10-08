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
