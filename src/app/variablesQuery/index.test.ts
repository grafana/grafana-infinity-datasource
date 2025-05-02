import { MutableDataFrame } from '@grafana/data';
import { getTemplateVariablesFromResult } from '@/app/variablesQuery';

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
