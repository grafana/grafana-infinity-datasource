import { defaultsDeep } from 'lodash';
import { DefaultInfinityQuery } from './../../constants';
import type { VariableQuery, VariableQueryInfinity } from './../../types';

export const migrateLegacyQuery = (query: VariableQuery | string): VariableQuery => {
  if (typeof query === 'string') {
    return {
      query: query,
      queryType: 'legacy',
      infinityQuery: {
        ...DefaultInfinityQuery,
        refId: 'variable',
      },
    };
  } else if (query && query.queryType) {
    return {
      ...query,
      infinityQuery: defaultsDeep((query as VariableQueryInfinity).infinityQuery, DefaultInfinityQuery),
    } as VariableQuery;
  } else {
    return {
      query: '',
      queryType: 'legacy',
    };
  }
};
