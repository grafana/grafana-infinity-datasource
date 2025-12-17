import { firstValueFrom } from 'rxjs';
import { DataQueryRequest, MutableDataFrame } from '@grafana/data';
import { getTemplateVariablesFromResult, InfinityVariableSupport, TEXT_FIELD_SELECTOR_IN_VARIABLE, VALUE_FIELD_SELECTOR_IN_VARIABLE } from '@/app/variablesQuery';
describe('getTemplateVariablesFromResult', () => {
  it('should return same value for value and text if only one field available', () => {
    let input = new MutableDataFrame({
      fields: [{ name: 'users', values: ['foo', 'bar'] }],
    });
    expect(getTemplateVariablesFromResult(input)).toStrictEqual([
      { value: 'foo', text: 'foo', properties: {} },
      { value: 'bar', text: 'bar', properties: {} },
    ]);
  });
  it('should return different values for value and text if two fields available', () => {
    let input = new MutableDataFrame({
      fields: [
        { name: 'users', values: ['foo', 'bar'] },
        { name: 'userIds', values: ['foo-id', 'bar-id'] },
      ],
    });
    expect(getTemplateVariablesFromResult(input)).toStrictEqual([
      { value: 'foo-id', text: 'foo', properties: {} },
      { value: 'bar-id', text: 'bar', properties: {} },
    ]);
  });
  it('should return same value for value and text if more than two fields available', () => {
    let input = new MutableDataFrame({
      fields: [
        { name: 'users', values: ['foo', 'bar'] },
        { name: 'usersIds', values: ['foo-id', 'bar-id'] },
        { name: 'userCounties', values: ['foo-country', 'bar-country'] },
      ],
    });
    expect(getTemplateVariablesFromResult(input)).toStrictEqual([
      { value: 'foo', text: 'foo', properties: { usersIds: 'foo-id', userCounties: 'foo-country' } },
      { value: 'bar', text: 'bar', properties: { usersIds: 'bar-id', userCounties: 'bar-country' } },
    ]);
  });
  describe('dataframe with more than 1 field', () => {
    it('with __text and __value', () => {
      const fields = [
        { name: 'users', values: ['foo', 'bar'] },
        { name: VALUE_FIELD_SELECTOR_IN_VARIABLE, values: ['v1', 'v2'] },
        { name: 'usersIds', values: ['foo-id', 'bar-id'] },
        { name: TEXT_FIELD_SELECTOR_IN_VARIABLE, values: ['t1', 't2'] },
        { name: 'userCounties', values: ['foo-country', 'bar-country'] },
      ];
      expect(getTemplateVariablesFromResult(new MutableDataFrame({ fields }))).toStrictEqual([
        {
          value: fields.find((f) => f.name === VALUE_FIELD_SELECTOR_IN_VARIABLE)?.values[0],
          text: fields.find((f) => f.name === TEXT_FIELD_SELECTOR_IN_VARIABLE)?.values[0],
          properties: {
            users: 'foo',
            usersIds: 'foo-id',
            userCounties: 'foo-country',
          },
        },
        {
          value: fields.find((f) => f.name === VALUE_FIELD_SELECTOR_IN_VARIABLE)?.values[1],
          text: fields.find((f) => f.name === TEXT_FIELD_SELECTOR_IN_VARIABLE)?.values[1],
          properties: {
            users: 'bar',
            usersIds: 'bar-id',
            userCounties: 'bar-country',
          },
        },
      ]);
    });
    it('with __text', () => {
      const fields = [
        { name: 'users', values: ['foo', 'bar'] },
        { name: 'usersIds', values: ['foo-id', 'bar-id'] },
        { name: TEXT_FIELD_SELECTOR_IN_VARIABLE, values: ['t1', 't2'] },
        { name: 'userCounties', values: ['foo-country', 'bar-country'] },
      ];
      expect(getTemplateVariablesFromResult(new MutableDataFrame({ fields }))).toStrictEqual([
        {
          value: fields.find((f) => f.name === TEXT_FIELD_SELECTOR_IN_VARIABLE)?.values[0],
          text: fields.find((f) => f.name === TEXT_FIELD_SELECTOR_IN_VARIABLE)?.values[0],
          properties: { users: 'foo', usersIds: 'foo-id', userCounties: 'foo-country' },
        },
        {
          value: fields.find((f) => f.name === TEXT_FIELD_SELECTOR_IN_VARIABLE)?.values[1],
          text: fields.find((f) => f.name === TEXT_FIELD_SELECTOR_IN_VARIABLE)?.values[1],
          properties: { users: 'bar', usersIds: 'bar-id', userCounties: 'bar-country' },
        },
      ]);
    });
    it('with __value', () => {
      const fields = [
        { name: 'users', values: ['foo', 'bar'] },
        { name: 'usersIds', values: ['foo-id', 'bar-id'] },
        { name: VALUE_FIELD_SELECTOR_IN_VARIABLE, values: ['v1', 'v2'] },
        { name: 'userCounties', values: ['foo-country', 'bar-country'] },
      ];
      expect(getTemplateVariablesFromResult(new MutableDataFrame({ fields }))).toStrictEqual([
        {
          value: fields.find((f) => f.name === VALUE_FIELD_SELECTOR_IN_VARIABLE)?.values[0],
          text: fields.find((f) => f.name === VALUE_FIELD_SELECTOR_IN_VARIABLE)?.values[0],
          properties: { users: 'foo', usersIds: 'foo-id', userCounties: 'foo-country' },
        },
        {
          value: fields.find((f) => f.name === VALUE_FIELD_SELECTOR_IN_VARIABLE)?.values[1],
          text: fields.find((f) => f.name === VALUE_FIELD_SELECTOR_IN_VARIABLE)?.values[1],
          properties: { users: 'bar', usersIds: 'bar-id', userCounties: 'bar-country' },
        },
      ]);
    });
    it('without __text or __value', () => {
      const fields = [
        { name: 'users', values: ['foo', 'bar'] },
        { name: 'usersIds', values: ['foo-id', 'bar-id'] },
        { name: 'userCounties', values: ['foo-country', 'bar-country'] },
      ];
      expect(getTemplateVariablesFromResult(new MutableDataFrame({ fields }))).toStrictEqual([
        { value: fields[0].values[0], text: fields[0].values[0], properties: { usersIds: 'foo-id', userCounties: 'foo-country' } },
        { value: fields[0].values[1], text: fields[0].values[1], properties: { usersIds: 'bar-id', userCounties: 'bar-country' } },
      ]);
    });
  });
  describe('dataframe with 2 fields', () => {
    it('with __text and __value', () => {
      const fields = [
        { name: TEXT_FIELD_SELECTOR_IN_VARIABLE, values: ['t1', 't2'] },
        { name: VALUE_FIELD_SELECTOR_IN_VARIABLE, values: ['v1', 'v2'] },
      ];
      expect(getTemplateVariablesFromResult(new MutableDataFrame({ fields }))).toStrictEqual([
        { value: fields.find((f) => f.name === VALUE_FIELD_SELECTOR_IN_VARIABLE)?.values[0], text: fields.find((f) => f.name === TEXT_FIELD_SELECTOR_IN_VARIABLE)?.values[0], properties: {} },
        { value: fields.find((f) => f.name === VALUE_FIELD_SELECTOR_IN_VARIABLE)?.values[1], text: fields.find((f) => f.name === TEXT_FIELD_SELECTOR_IN_VARIABLE)?.values[1], properties: {} },
      ]);
    });
    it('with __text', () => {
      const fields = [
        { name: 'users', values: ['foo', 'bar'] },
        { name: TEXT_FIELD_SELECTOR_IN_VARIABLE, values: ['t1', 't2'] },
      ];
      expect(getTemplateVariablesFromResult(new MutableDataFrame({ fields }))).toStrictEqual([
        {
          value: fields.find((f) => f.name === TEXT_FIELD_SELECTOR_IN_VARIABLE)?.values[0],
          text: fields.find((f) => f.name === TEXT_FIELD_SELECTOR_IN_VARIABLE)?.values[0],
          properties: { users: 'foo' },
        },
        {
          value: fields.find((f) => f.name === TEXT_FIELD_SELECTOR_IN_VARIABLE)?.values[1],
          text: fields.find((f) => f.name === TEXT_FIELD_SELECTOR_IN_VARIABLE)?.values[1],
          properties: { users: 'bar' },
        },
      ]);
    });
    it('with __value', () => {
      const fields = [
        { name: 'users', values: ['foo', 'bar'] },
        { name: VALUE_FIELD_SELECTOR_IN_VARIABLE, values: ['v1', 'v2'] },
      ];
      expect(getTemplateVariablesFromResult(new MutableDataFrame({ fields }))).toStrictEqual([
        {
          value: fields.find((f) => f.name === VALUE_FIELD_SELECTOR_IN_VARIABLE)?.values[0],
          text: fields.find((f) => f.name === VALUE_FIELD_SELECTOR_IN_VARIABLE)?.values[0],
          properties: { users: 'foo' },
        },
        {
          value: fields.find((f) => f.name === VALUE_FIELD_SELECTOR_IN_VARIABLE)?.values[1],
          text: fields.find((f) => f.name === VALUE_FIELD_SELECTOR_IN_VARIABLE)?.values[1],
          properties: { users: 'bar' },
        },
      ]);
    });
    it('without __text or __value', () => {
      const fields = [
        { name: 'users', values: ['foo', 'bar'] },
        { name: 'usersIds', values: ['foo-id', 'bar-id'] },
      ];
      expect(getTemplateVariablesFromResult(new MutableDataFrame({ fields }))).toStrictEqual([
        { value: fields[1].values[0], text: fields[0].values[0], properties: {} },
        { value: fields[1].values[1], text: fields[0].values[1], properties: {} },
      ]);
    });
  });
  describe('dataframe with 1 field', () => {
    it('first field', () => {
      const fields = [{ name: 'users', values: ['foo', 'bar'] }];
      expect(getTemplateVariablesFromResult(new MutableDataFrame({ fields }))).toStrictEqual([
        { value: fields[0].values[0], text: fields[0].values[0], properties: {} },
        { value: fields[0].values[1], text: fields[0].values[1], properties: {} },
      ]);
    });
  });
});

describe('test InfinityVariableSupport', () => {
  afterEach(() => jest.restoreAllMocks());
  describe('query', () => {
    describe('Random', () => {
      it('emits data wrapped from getVariableQueryValues result', async () => {
        const mockResult = [{ text: 'A', value: 'A' }];
        const ds: any = { getVariableQueryValues: jest.fn().mockResolvedValue(mockResult) };
        const support = new InfinityVariableSupport(ds as any);
        const query = { queryType: 'legacy', query: 'Random(A)' };
        const request = { targets: [query], scopedVars: {} } as DataQueryRequest<any>;
        const emitted = await firstValueFrom(support.query(request));
        expect(emitted).toEqual({ data: mockResult });
        expect(ds.getVariableQueryValues).toHaveBeenCalledWith(request.targets[0], { scopedVars: request.scopedVars });
      });

      it('emits empty array when getVariableQueryValues resolves empty', async () => {
        const mockResult: any[] = [];
        const ds: any = { getVariableQueryValues: jest.fn().mockResolvedValue(mockResult) };
        const support = new InfinityVariableSupport(ds as any);
        const query = { queryType: 'legacy', query: 'Random()' };
        const request = { targets: [query], scopedVars: {} } as DataQueryRequest<any>;
        const emitted = await firstValueFrom(support.query(request));
        expect(emitted).toEqual({ data: mockResult });
      });
    });
  });
});
