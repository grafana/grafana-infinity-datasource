import { firstValueFrom } from 'rxjs';
import { DataQueryRequest, MutableDataFrame } from '@grafana/data';
import { getTemplateVariablesFromResult, InfinityVariableSupport } from '@/app/variablesQuery';
describe('getTemplateVariablesFromResult', () => {
  it('should return same value for value and text if only one field available', () => {
    let input = new MutableDataFrame({
      fields: [{ name: 'users', values: ['foo', 'bar'] }],
    });
    expect(getTemplateVariablesFromResult(input)).toStrictEqual([
      { value: 'foo', text: 'foo' },
      { value: 'bar', text: 'bar' },
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
      { value: 'foo-id', text: 'foo' },
      { value: 'bar-id', text: 'bar' },
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
      { value: 'foo', text: 'foo' },
      { value: 'bar', text: 'bar' },
    ]);
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
