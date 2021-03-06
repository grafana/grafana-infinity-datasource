import { DataFrame, DataService, DataQuery, PluginContext, logger } from '@grafana/tsbackend';
import { InfinityQuery, InfinityOptions, GlobalInfinityQuery } from '../shared/types';
import { InfinityProvider } from './app/InfinityProvider';
import { SeriesProvider } from './app/SeriesProvider';
import { flatten } from 'lodash';

export class InfinityDataService extends DataService<InfinityQuery, InfinityOptions> {
  constructor() {
    super();
  }

  QueryData(request: DataQuery<InfinityQuery>, context: PluginContext<InfinityOptions>): Promise<DataFrame[]> {
    try {
      const { json } = context.datasourceinstancesettings!;
      let { query } = request;
      logger.debug("request", request, "context", context);
      const promises: Promise<DataFrame[]>[] = [];
      
      if (
        query.type === 'global' &&
        query.global_query_id &&
        json?.global_queries &&
        json?.global_queries.length > 0
      ) {
        let matchingQuery: GlobalInfinityQuery | undefined = json?.global_queries.find(
          (q: GlobalInfinityQuery) => q.id === query.global_query_id
        );
        query = matchingQuery ? matchingQuery.query : query;
      }
      promises.push(
        new Promise((resolve, reject) => {
          switch (query.type) {
            case 'csv':
            case 'html':
            case 'json':
            case 'graphql':
              new InfinityProvider(query, context.datasourceinstancesettings!)
                .query()
                .then(res => res)
                .catch(ex => {
                  reject(ex);
                });
              break;
            case 'series':
              new SeriesProvider(query)
                .query(request.timerange?.fromepochms || 0, request.timerange?.toepochms || 0)
                .then(res => res)
                .catch(ex => {
                  reject(ex);
                });
              break;
            case 'global':
              reject('Query not found');
              break;
            default:
              reject('Unknown Query Type');
              break;
          }
        })
      );
      return Promise.all(promises).then(results => {
        return flatten(results);
      });
    } catch(ex) {
      logger.debug("EXCEPTION", ex);
      return Promise.resolve([]);
    }
  }
    
}