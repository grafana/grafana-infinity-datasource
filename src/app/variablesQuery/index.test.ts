import { firstValueFrom } from 'rxjs';
import { createDataFrame, DataFrame, DataQueryRequest } from '@grafana/data';
import * as runtime from '@grafana/runtime';
import { convertOriginalFieldsToVariableFields, InfinityVariableSupport, LegacyVariableProvider } from '@/app/variablesQuery';

describe('convertOriginalFieldsToVariableFields', () => {
  it('should return same value for value and text if only one field available', () => {
    let input = createDataFrame({
      fields: [{ name: 'users', values: ['foo', 'bar'] }],
    });
    expect(getVariablePairsFromFrame(input)).toStrictEqual([
      { value: 'foo', text: 'foo' },
      { value: 'bar', text: 'bar' },
    ]);
  });
  it('should return different values for value and text if two fields available', () => {
    let input = createDataFrame({
      fields: [
        { name: 'users', values: ['foo', 'bar'] },
        { name: 'userIds', values: ['foo-id', 'bar-id'] },
      ],
    });
    expect(getVariablePairsFromFrame(input)).toStrictEqual([
      { value: 'foo-id', text: 'foo' },
      { value: 'bar-id', text: 'bar' },
    ]);
  });
  it('should return same value for value and text if more than two fields available', () => {
    let input = createDataFrame({
      fields: [
        { name: 'users', values: ['foo', 'bar'] },
        { name: 'usersIds', values: ['foo-id', 'bar-id'] },
        { name: 'userCounties', values: ['foo-country', 'bar-country'] },
      ],
    });
    expect(getVariablePairsFromFrame(input)).toStrictEqual([
      { value: 'foo', text: 'foo' },
      { value: 'bar', text: 'bar' },
    ]);
  });
  describe('dataframe with more than 1 field', () => {
    it('with __text and __value', () => {
      const fields = [
        { name: 'users', values: ['foo', 'bar'] },
        { name: '__value', values: ['v1', 'v2'] },
        { name: 'usersIds', values: ['foo-id', 'bar-id'] },
        { name: '__text', values: ['t1', 't2'] },
        { name: 'userCounties', values: ['foo-country', 'bar-country'] },
      ];
      expect(getVariablePairsFromFrame(createDataFrame({ fields }))).toStrictEqual([
        { value: fields.find((f) => f.name === '__value')?.values[0], text: fields.find((f) => f.name === '__text')?.values[0] },
        { value: fields.find((f) => f.name === '__value')?.values[1], text: fields.find((f) => f.name === '__text')?.values[1] },
      ]);
    });
    it('with __text', () => {
      const fields = [
        { name: 'users', values: ['foo', 'bar'] },
        { name: 'usersIds', values: ['foo-id', 'bar-id'] },
        { name: '__text', values: ['t1', 't2'] },
        { name: 'userCounties', values: ['foo-country', 'bar-country'] },
      ];
      expect(getVariablePairsFromFrame(createDataFrame({ fields }))).toStrictEqual([
        { value: fields.find((f) => f.name === '__text')?.values[0], text: fields.find((f) => f.name === '__text')?.values[0] },
        { value: fields.find((f) => f.name === '__text')?.values[1], text: fields.find((f) => f.name === '__text')?.values[1] },
      ]);
    });
    it('with __value', () => {
      const fields = [
        { name: 'users', values: ['foo', 'bar'] },
        { name: 'usersIds', values: ['foo-id', 'bar-id'] },
        { name: '__value', values: ['v1', 'v2'] },
        { name: 'userCounties', values: ['foo-country', 'bar-country'] },
      ];
      expect(getVariablePairsFromFrame(createDataFrame({ fields }))).toStrictEqual([
        { value: fields.find((f) => f.name === '__value')?.values[0], text: fields.find((f) => f.name === '__value')?.values[0] },
        { value: fields.find((f) => f.name === '__value')?.values[1], text: fields.find((f) => f.name === '__value')?.values[1] },
      ]);
    });
    it('without __text or __value', () => {
      const fields = [
        { name: 'users', values: ['foo', 'bar'] },
        { name: 'usersIds', values: ['foo-id', 'bar-id'] },
        { name: 'userCounties', values: ['foo-country', 'bar-country'] },
      ];
      expect(getVariablePairsFromFrame(createDataFrame({ fields }))).toStrictEqual([
        { value: fields[0].values[0], text: fields[0].values[0] },
        { value: fields[0].values[1], text: fields[0].values[1] },
      ]);
    });
  });
  describe('dataframe with 2 fields', () => {
    it('with __text and __value', () => {
      const fields = [
        { name: '__text', values: ['t1', 't2'] },
        { name: '__value', values: ['v1', 'v2'] },
      ];
      expect(getVariablePairsFromFrame(createDataFrame({ fields }))).toStrictEqual([
        { value: fields.find((f) => f.name === '__value')?.values[0], text: fields.find((f) => f.name === '__text')?.values[0] },
        { value: fields.find((f) => f.name === '__value')?.values[1], text: fields.find((f) => f.name === '__text')?.values[1] },
      ]);
    });
    it('with __text', () => {
      const fields = [
        { name: 'users', values: ['foo', 'bar'] },
        { name: '__text', values: ['t1', 't2'] },
      ];
      expect(getVariablePairsFromFrame(createDataFrame({ fields }))).toStrictEqual([
        { value: fields.find((f) => f.name === '__text')?.values[0], text: fields.find((f) => f.name === '__text')?.values[0] },
        { value: fields.find((f) => f.name === '__text')?.values[1], text: fields.find((f) => f.name === '__text')?.values[1] },
      ]);
    });
    it('with __value', () => {
      const fields = [
        { name: 'users', values: ['foo', 'bar'] },
        { name: '__value', values: ['v1', 'v2'] },
      ];
      expect(getVariablePairsFromFrame(createDataFrame({ fields }))).toStrictEqual([
        { value: fields.find((f) => f.name === '__value')?.values[0], text: fields.find((f) => f.name === '__value')?.values[0] },
        { value: fields.find((f) => f.name === '__value')?.values[1], text: fields.find((f) => f.name === '__value')?.values[1] },
      ]);
    });
    it('without __text or __value', () => {
      const fields = [
        { name: 'users', values: ['foo', 'bar'] },
        { name: 'usersIds', values: ['foo-id', 'bar-id'] },
      ];
      expect(getVariablePairsFromFrame(createDataFrame({ fields }))).toStrictEqual([
        { value: fields[1].values[0], text: fields[0].values[0] },
        { value: fields[1].values[1], text: fields[0].values[1] },
      ]);
    });
  });
  describe('dataframe with 1 field', () => {
    it('first field', () => {
      const fields = [{ name: 'users', values: ['foo', 'bar'] }];
      expect(getVariablePairsFromFrame(createDataFrame({ fields }))).toStrictEqual([
        { value: fields[0].values[0], text: fields[0].values[0] },
        { value: fields[0].values[1], text: fields[0].values[1] },
      ]);
    });
  });
});

describe('test InfinityVariableSupport', () => {
  beforeEach(() => {
    jest.spyOn(runtime, 'getTemplateSrv').mockReturnValue({
      replace: (value: string) => value,
    } as any);
  });
  afterEach(() => jest.restoreAllMocks());
  describe('query', () => {
    describe('Random', () => {
      it('emits data wrapped from getVariableQueryValues result', async () => {
        const mockResult = [{ text: 'A', value: 'a' }];
        jest.spyOn(LegacyVariableProvider.prototype, 'query').mockResolvedValueOnce(mockResult);
        const ds: any = { getVariableQueryValues: jest.fn() };
        const support = new InfinityVariableSupport(ds as any);
        const query = { queryType: 'legacy', query: 'Random(A)' };
        const request = { targets: [query], scopedVars: {} } as DataQueryRequest<any>;
        const emitted = await firstValueFrom(support.query(request));
        expect(emitted.data).toHaveLength(1);
        const frame = emitted.data[0];
        expect(frame.refId).toBe('variable');
        expect(frame.fields[0].name).toBe('value');
        expect(frame.fields[1].name).toBe('text');
        expect(frame.fields[0].values.get(0)).toBe('a');
        expect(frame.fields[1].values.get(0)).toBe('A');
      });

      it('emits empty array when getVariableQueryValues resolves empty', async () => {
        const mockResult: any[] = [];
        jest.spyOn(LegacyVariableProvider.prototype, 'query').mockResolvedValueOnce(mockResult);
        const ds: any = { getVariableQueryValues: jest.fn() };
        const support = new InfinityVariableSupport(ds as any);
        const query = { queryType: 'legacy', query: 'Random()' };
        const request = { targets: [query], scopedVars: {} } as DataQueryRequest<any>;
        const emitted = await firstValueFrom(support.query(request));
        expect(emitted.data).toHaveLength(1);
        const frame = emitted.data[0];
        expect(frame.fields[0].values.length).toBe(0);
        expect(frame.fields[1].values.length).toBe(0);
      });
    });
  });
});

const getVariablePairsFromFrame = (frame: DataFrame): Array<{ value: any; text: any }> => {
  const convertedFields = convertOriginalFieldsToVariableFields(frame.fields);
  const tf = convertedFields.find((f) => f.name === 'text');
  const vf = convertedFields.find((f) => f.name === 'value');
  return (vf?.values || []).map((value, idx) => ({ value, text: (tf?.values || [])[idx] }));
};
