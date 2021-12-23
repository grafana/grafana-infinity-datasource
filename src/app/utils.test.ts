import { getUniqueFieldNames, getFieldsByGroupName } from './utils';

describe('utils', () => {
  describe('getUniqueFieldNames', () => {
    it('default', () => {
      expect(getUniqueFieldNames('hello')).toStrictEqual(['hello']);
      expect(getUniqueFieldNames(1)).toStrictEqual(['1']);
      expect(getUniqueFieldNames({})).toStrictEqual([]);
      expect(getUniqueFieldNames({ foo: 'foo1', bar: 'bar1', baz: [], bam: {} })).toStrictEqual(['foo', 'bar', 'baz', 'bam']);
      expect(getUniqueFieldNames([{ foo: 'foo1' }, { foo: 'foo2', bar: 'bar2' }, { bar: 'bar3' }, { baz: 'baz4', foo: 'foo4' }])).toStrictEqual(['foo', 'bar', 'baz']);
    });
  });
  describe('getFieldsByGroupName', () => {
    it('default', () => {
      expect(getFieldsByGroupName('foo')).toStrictEqual({});
      expect(getFieldsByGroupName(1)).toStrictEqual({});
      expect(getFieldsByGroupName({ foo: 'foo1', bar: 1, baz: new Date(), bam: 'bam1' })).toStrictEqual({ date_fields: ['baz'], numeric_fields: ['bar'], string_fields: ['foo', 'bam'] });
      expect(getFieldsByGroupName([{ foo: 'foo1' }, { foo: 'foo2' }, { bar: 2 }, { foo: 2, baz: new Date() }])).toStrictEqual({
        date_fields: ['baz'],
        numeric_fields: ['bar'],
        string_fields: ['foo'],
      });
    });
  });
});
