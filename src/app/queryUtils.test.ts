import * as runtime from '@grafana/runtime';
import { InfinityConfig, InfinityInstanceSettings, InfinityQuery } from 'types';
import { migrateLegacyVariableQuery, replaceGlobalQuery, replaceVariables } from './queryUtils';

describe('queryUtils', () => {
  describe('replaceVariables', () => {
    const replace = jest.fn();
    beforeEach(() => {
      jest.spyOn(runtime, 'getTemplateSrv').mockImplementation(() => ({ getVariables: jest.fn(), replace }));
    });
    it('return query as it is', () => {
      const q = replaceVariables({} as InfinityQuery, {});
      expect(q).toStrictEqual(q);
    });
    it('replace method should be called for json url query', () => {
      replaceVariables({ type: 'json', source: 'url', url: 'https://foo.com?v=${bar}', url_options: { data: 'foo' } } as InfinityQuery, {});
      expect(replace).toHaveBeenCalledTimes(2);
      expect(replace).toHaveBeenNthCalledWith(1, 'https://foo.com?v=${bar}', {}, 'glob');
      expect(replace).toHaveBeenNthCalledWith(2, 'foo', {}, 'glob');
    });
    it('replace method should be called for csv inline query', () => {
      replaceVariables({ type: 'csv', source: 'inline', data: 'foo' } as InfinityQuery, {});
      expect(replace).toHaveBeenCalledTimes(3);
      expect(replace).toHaveBeenNthCalledWith(3, 'foo', {}, 'glob');
    });
    it('replace method should be called for json url query with headers and params', () => {
      replaceVariables(
        {
          type: 'json',
          source: 'url',
          url: 'https://foo.com?v=${bar}',
          url_options: { data: 'foo', headers: [{ key: 'k1', value: 'v1' }], params: [{ key: 'k2', value: 'v2' }] },
        } as InfinityQuery,
        {}
      );
      expect(replace).toHaveBeenCalledTimes(7);
      expect(replace).toHaveBeenNthCalledWith(6, 'v2', {}, 'glob');
      expect(replace).toHaveBeenNthCalledWith(7, 'v1', {}, 'glob');
    });
    it('replace method should be called for filters', () => {
      replaceVariables(
        {
          type: 'xml',
          source: 'url',
          url: 'https://foo.com?v=${bar}',
          url_options: { data: 'data' },
          filters: [{ value: ['foo', 'bar'] }],
        } as InfinityQuery,
        {}
      );
      expect(replace).toHaveBeenCalledTimes(11);
      expect(replace).toHaveBeenNthCalledWith(8, 'foo', {}, 'glob');
      expect(replace).toHaveBeenNthCalledWith(9, 'bar', {}, 'glob');
      expect(replace).toHaveBeenNthCalledWith(10, 'https://foo.com?v=${bar}', {}, 'glob');
      expect(replace).toHaveBeenNthCalledWith(11, 'data', {}, 'glob');
    });
  });
  describe('replaceGlobalQuery', () => {
    it('default query should be return as it is', () => {
      const q = replaceGlobalQuery({} as InfinityQuery, {} as InfinityInstanceSettings);
      expect(q).toStrictEqual({});
    });
    it('non global query should be return as it is', () => {
      const q = replaceGlobalQuery({ type: 'csv' } as InfinityQuery, {} as InfinityInstanceSettings);
      expect(q).toStrictEqual({ type: 'csv' });
    });
    it('global query should be return as it is if no query in instance settings', () => {
      const q = replaceGlobalQuery({ type: 'global', global_query_id: 'foo' } as InfinityQuery, {} as InfinityInstanceSettings);
      expect(q).toStrictEqual({ type: 'global', global_query_id: 'foo' });
    });
    it('global query should be return as it is if no matching query found in instance settings', () => {
      const q = replaceGlobalQuery(
        { type: 'global', global_query_id: 'foo' } as InfinityQuery,
        {
          jsonData: {
            global_queries: [
              { id: 'bar', name: 'Bar', query: { type: 'csv' } },
              { id: 'baz', name: 'Baz', query: { type: 'json' } },
            ],
          } as InfinityConfig,
        } as InfinityInstanceSettings
      );
      expect(q).toStrictEqual({ type: 'global', global_query_id: 'foo' });
    });
    it('global query should be return corresponding query', () => {
      const q = replaceGlobalQuery(
        { type: 'global', global_query_id: 'foo' } as InfinityQuery,
        {
          jsonData: {
            global_queries: [
              { id: 'bar', name: 'Bar', query: { type: 'csv' } },
              { id: 'foo', name: 'Foo', query: { type: 'json' } },
            ],
          } as InfinityConfig,
        } as InfinityInstanceSettings
      );
      expect(q).toStrictEqual({ type: 'json' });
    });
  });
  describe('migrateLegacyVariableQuery', () => {
    it('empty query should return infinity query', () => {
      const q = migrateLegacyVariableQuery();
      expect(q).toStrictEqual({ queryType: 'infinity', infinityQuery: { type: 'json' } });
    });
    it('string query should return legacy query', () => {
      const q = migrateLegacyVariableQuery('foo');
      expect(q).toStrictEqual({ queryType: 'legacy', query: 'foo' });
    });
    it('legacy query should return legacy query', () => {
      const q = migrateLegacyVariableQuery({ queryType: 'legacy', query: 'foo' });
      expect(q).toStrictEqual({ queryType: 'legacy', query: 'foo' });
    });
    it('infinity query should return infinity query', () => {
      const q = migrateLegacyVariableQuery({ queryType: 'infinity', infinityQuery: { refId: 'foo', type: 'csv' } as InfinityQuery });
      expect(q).toStrictEqual({ queryType: 'infinity', infinityQuery: { refId: 'foo', type: 'csv' } });
    });
  });
});
