import { isDataQuery, isInfinityQueryWithUrlSource } from './app/utils';
import type { InfinityQuery } from './types';

/**
 * ************************************************
 * Handles all the query migrations including the following
 * * Migrate raw body type to detailed body type object in url options
 * * Set the parser to backend if not set (defaults to backend parser)
 * ************************************************
 * NOTE: DON'T interpolate query here
 * ************************************************
 * @param  {InfinityQuery} query
 * @returns InfinityQuery
 */
export const migrateQuery = (query: InfinityQuery): InfinityQuery => {
  let newQuery: InfinityQuery = { ...query };
  newQuery = setDefaultParserToBackend(newQuery);
  if (isDataQuery(newQuery) && newQuery.source === 'url' && newQuery.url_options.method === 'POST') {
    if (!newQuery.url_options.body_type) {
      if (newQuery.type === 'graphql') {
        newQuery = {
          ...newQuery,
          url_options: {
            ...(newQuery.url_options || {}),
            body_type: 'graphql',
            body_graphql_query: newQuery.url_options.body_graphql_query || newQuery.url_options.data || '',
            body_content_type: 'application/json',
            data: '',
          },
        };
      } else {
        newQuery = {
          ...newQuery,
          url_options: { ...(newQuery.url_options || {}), body_type: 'raw' },
        };
      }
    }
    if (!newQuery.url_options.body_content_type) {
      newQuery.url_options.body_content_type = 'text/plain';
    }
  }
  return newQuery;
};

export const setDefaultParserToBackend = (query: InfinityQuery): InfinityQuery => {
  let newQuery: InfinityQuery = { ...query };
  if (!isDataQuery(newQuery)) {
    return newQuery;
  }

  // if the parser is already set, we should respect that
  // if the root_selector is already set, overriding the parser type will break the queries with frontend parsing. So we should leave as it is
  // if the query have columns defined, overriding the parser type will break the queries with frontend parsing. So we should leave as it is
  if (newQuery?.parser || newQuery?.root_selector || newQuery?.columns?.length > 0) {
    return newQuery;
  }

  if (newQuery?.parser === undefined) {
    // If query has no parser and it is a URL source query without a url, then this query is new and we want to use the backend parser.
    if (isInfinityQueryWithUrlSource(newQuery) && newQuery.url === '') {
      return { ...newQuery, parser: 'backend' };
    }
    // Otherwise use the simple parser. This is to ensure that old queries created before 3.0 continue to work, as simple parser
    // was the default parser and if users have not touched the parser field it was set to simple.
    return { ...newQuery, parser: 'simple' };
  }

  return { ...newQuery, parser: 'backend' };
};
