import { InfinityQuery } from 'types/query.types';
import { migrateQuery } from './migrate';

describe('Query Migration', () => {
  it('should set parser to backend for new URL source query with empty URL', () => {
    const query = {
      refId: 'A',
      type: 'json',
      source: 'url',
      url: '',
      url_options: { method: 'GET', data: '' },
    } as InfinityQuery;
    const result = migrateQuery(query);
    expect(result).toEqual({
      ...query,
      parser: 'backend',
    });
  });

  // This is to ensure that old queries created before 3.0 continue to work as simple parser was the default parser
  // and if users have not touched the parser field it was set to simple
  it('should set parser to simple for existing queries without parser', () => {
    const query = {
      refId: 'A',
      type: 'json',
      source: 'url',
      url: 'http://example.com',
      url_options: { method: 'GET', data: '' },
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
      url_options: { method: 'GET', data: '' },
    } as InfinityQuery;
    const result = migrateQuery(query);
    expect(result).toEqual(query);
  });

  it('should not modify parser when root_selector is set', () => {
    const query = {
      refId: 'A',
      type: 'json',
      source: 'url',
      root_selector: 'data',
      url_options: { method: 'GET', data: '' },
    } as InfinityQuery;
    const result = migrateQuery(query);
    expect(result).toEqual(query);
  });

  it('should not modify parser when columns are defined', () => {
    const query = {
      refId: 'A',
      type: 'json',
      source: 'url',
      columns: [{ selector: 'field', text: 'Field', type: 'string' }],
      url_options: { method: 'GET', data: '' },
    } as InfinityQuery;
    const result = migrateQuery(query);
    expect(result).toEqual(query);
  });
});
