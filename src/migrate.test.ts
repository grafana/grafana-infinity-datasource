import { InfinityQuery } from 'types/query.types';
import { migrateQuery } from './migrate';

describe('Query Migration', () => {
  it('should set parser to simple when parser is undefined', () => {
    const query = {
      refId: 'A',
      type: 'json',
      source: 'url',
    } as InfinityQuery;
    const result = migrateQuery(query);
    expect(result).toEqual({
      ...query,
      parser: 'simple',
    });
  });

  it('should not modify parser when it is already set', () => {
    const query = {
      refId: 'A',
      source: 'url',
      parser: 'backend',
    } as InfinityQuery;
    const result = migrateQuery(query);
    expect(result).toEqual(query);
  });

  it('should preserve other fields while setting default parser', () => {
    const query = {
      refId: 'A',
      type: 'json',
      source: 'url',
      url: 'http://example.com',
      root_selector: 'data',
    } as InfinityQuery;
    const result = migrateQuery(query);
    expect(result).toEqual({
      ...query,
      parser: 'simple',
    });
  });
});
