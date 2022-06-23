import { isDataQuery } from './app/utils';
import type { InfinityQuery } from './types';

/**
 * ************************************************
 * Handles all the query migrations including the following
 * * Migrate raw body type to detailed body type object in url options
 * ************************************************
 * NOTE: DON'T interpolate query here
 * ************************************************
 * @param  {InfinityQuery} query
 * @returns InfinityQuery
 */
export const migrateQuery = (query: InfinityQuery): InfinityQuery => {
  const newQuery: InfinityQuery = { ...query };
  if (isDataQuery(newQuery) && newQuery.source === 'url' && newQuery.url_options.method === 'POST') {
    if (!newQuery.url_options.body_type) {
      if (newQuery.type === 'graphql') {
        newQuery.url_options.body_type = 'graphql';
        newQuery.url_options.body_graphql_query = newQuery.url_options.body_graphql_query || newQuery.url_options.data || '';
        newQuery.url_options.body_content_type = 'application/json';
        newQuery.url_options.data = '';
      } else {
        newQuery.url_options.body_type = 'raw';
      }
    }
    if (!newQuery.url_options.body_content_type) {
      newQuery.url_options.body_content_type = 'text/plain';
    }
  }
  return newQuery;
};
