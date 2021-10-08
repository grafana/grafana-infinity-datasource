import { migrateLegacyQuery } from './index';
import { VariableQuery, DefaultInfinityQuery } from './../../types';

describe('migrateLegacyQuery', () => {
  it('Empty Query', () => {
    let originalQuery = '';
    let newQuery = migrateLegacyQuery(originalQuery);
    expect(newQuery.queryType).toBe('legacy');
    expect(newQuery.query).toBe(originalQuery);
  });
  it('String Query', () => {
    let originalQuery = 'Collection(A,a,B,b)';
    let newQuery = migrateLegacyQuery(originalQuery);
    expect(newQuery.queryType).toBe('legacy');
    expect(newQuery.query).toBe(originalQuery);
  });
  it('Empty Infinity Query', () => {
    let originalQuery: VariableQuery = {
      queryType: 'infinity',
      query: '',
    };
    let newQuery = migrateLegacyQuery(originalQuery);
    expect(newQuery.queryType).toBe('infinity');
    expect(newQuery.query).toBe(originalQuery.query);
    expect(newQuery.infinityQuery?.type).toBe('json');
  });
  it('Infinity Query', () => {
    let originalQuery: VariableQuery = {
      queryType: 'infinity',
      query: '',
      infinityQuery: DefaultInfinityQuery,
    };
    let newQuery = migrateLegacyQuery(originalQuery);
    expect(newQuery.queryType).toBe('infinity');
    expect(newQuery.query).toBe(originalQuery.query);
    expect(newQuery.infinityQuery?.type).toBe('json');
  });
});
