import { migrateLegacyQuery } from './index';
import { VariableQuery, DefaultInfinityQuery, VariableQueryLegacy, VariableQueryInfinity } from './../../types';

describe('migrateLegacyQuery', () => {
  it('Empty Query', () => {
    let originalQuery = '';
    let newQuery = migrateLegacyQuery(originalQuery) as VariableQueryLegacy;
    expect(newQuery.queryType).toBe('legacy');
    expect(newQuery.query).toBe(originalQuery);
  });
  it('String Query', () => {
    let originalQuery = 'Collection(A,a,B,b)';
    let newQuery = migrateLegacyQuery(originalQuery) as VariableQueryLegacy;
    expect(newQuery.queryType).toBe('legacy');
    expect(newQuery.query).toBe(originalQuery);
  });
  it('Infinity Query', () => {
    let originalQuery: VariableQuery = {
      queryType: 'infinity',
      infinityQuery: DefaultInfinityQuery,
    };
    let newQuery = migrateLegacyQuery(originalQuery) as VariableQueryInfinity;
    expect(newQuery.queryType).toBe('infinity');
    expect(newQuery.infinityQuery?.type).toBe('json');
  });
});
