import { replaceTokenFromVariable, migrateLegacyQuery, DefaultInfinityQuery } from './index';
import { InfinityQueryType, VariableQuery, VariableQueryType, VariableTokenLegacy } from './../../types';

const data: Array<[string, VariableTokenLegacy, string]> = [
  ['Collection(A,a,B,b)', 'Collection', 'A,a,B,b'],
  ['CollectionLookup(A,a,B,b,A)', 'CollectionLookup', 'A,a,B,b,A'],
  ['Random(A,a,B,b,A)', 'Random', 'A,a,B,b,A'],
  ['Join(A,a,B,b,A)', 'Join', 'A,a,B,b,A'],
  ['Something(A,a,B,b,A)', 'Join', 'Something(A,a,B,b,A)'],
];

data.forEach((item, index) => {
  describe('replaceTokenFromVariable', () => {
    it(`replaceTokenFromVariable ${index + 1} ${item[1]}`, () => {
      expect(replaceTokenFromVariable(item[0], item[1])).toBe(item[2]);
    });
  });
});

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
  it('Empty Inifinity Query', () => {
    let originalQuery: VariableQuery = {
      queryType: VariableQueryType.Infinity,
      query: '',
    };
    let newQuery = migrateLegacyQuery(originalQuery);
    expect(newQuery.queryType).toBe(VariableQueryType.Infinity);
    expect(newQuery.query).toBe(originalQuery.query);
    expect(newQuery.infinityQuery?.type).toBe(InfinityQueryType.CSV);
  });
  it('Inifinity Query', () => {
    let originalQuery: VariableQuery = {
      queryType: VariableQueryType.Infinity,
      query: '',
      infinityQuery: DefaultInfinityQuery,
    };
    let newQuery = migrateLegacyQuery(originalQuery);
    expect(newQuery.queryType).toBe(VariableQueryType.Infinity);
    expect(newQuery.query).toBe(originalQuery.query);
    expect(newQuery.infinityQuery?.type).toBe(InfinityQueryType.CSV);
  });
});
