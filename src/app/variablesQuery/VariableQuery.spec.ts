import { migrateLegacyQuery } from './index';
import { InfinityQueryType, VariableQuery, VariableQueryType, DefaultInfinityQuery } from './../../types';

describe('migrateLegacyQuery', () => {
  it('Empty Query', () => {
    let originalQuery = '';
    let newQuery = migrateLegacyQuery(originalQuery);
    expect(newQuery.queryType).toBe(VariableQueryType.Legacy);
    expect(newQuery.query).toBe(originalQuery);
  });
  it('String Query', () => {
    let originalQuery = 'Collection(A,a,B,b)';
    let newQuery = migrateLegacyQuery(originalQuery);
    expect(newQuery.queryType).toBe(VariableQueryType.Legacy);
    expect(newQuery.query).toBe(originalQuery);
  });
  it('Empty Infinity Query', () => {
    let originalQuery: VariableQuery = {
      queryType: VariableQueryType.Infinity,
      query: '',
    };
    let newQuery = migrateLegacyQuery(originalQuery);
    expect(newQuery.queryType).toBe(VariableQueryType.Infinity);
    expect(newQuery.query).toBe(originalQuery.query);
    expect(newQuery.infinityQuery?.type).toBe(InfinityQueryType.JSON);
  });
  it('Infinity Query', () => {
    let originalQuery: VariableQuery = {
      queryType: VariableQueryType.Infinity,
      query: '',
      infinityQuery: DefaultInfinityQuery,
    };
    let newQuery = migrateLegacyQuery(originalQuery);
    expect(newQuery.queryType).toBe(VariableQueryType.Infinity);
    expect(newQuery.query).toBe(originalQuery.query);
    expect(newQuery.infinityQuery?.type).toBe(InfinityQueryType.JSON);
  });
});
