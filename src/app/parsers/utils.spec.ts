import { getValue } from './utils';

describe('utils', () => {
  it('getValue', () => {
    expect(getValue('', 'string')).toStrictEqual('');
    expect(getValue('hello 123', 'string')).toStrictEqual('hello 123');
    expect(getValue(123, 'string')).toStrictEqual('123');
    expect(getValue(0, 'string')).toStrictEqual('0');

    expect(getValue(123.45, 'number')).toStrictEqual(123.45);
    expect(getValue('123', 'number')).toStrictEqual(123);
    expect(getValue('123.45', 'number')).toStrictEqual(123.45);
    expect(getValue('1,234.5', 'number')).toStrictEqual(1234.5);
    expect(getValue('1,234.5abcdef:;!@#$$%^&*()ABCDEF', 'number')).toStrictEqual(1234.5);
    expect(getValue(null, 'number')).toStrictEqual(null);
    expect(getValue('192.168.0.0', 'number')).toStrictEqual(NaN);

    expect(getValue('2021', 'timestamp')).toStrictEqual(new Date('2021'));
    expect(getValue('2021-SEP-20', 'timestamp')).toStrictEqual(new Date('2021-SEP-20'));
    expect(getValue('1609459200000', 'timestamp_epoch')).toStrictEqual(new Date('2021'));
    expect(getValue(1609459200000, 'timestamp_epoch')).toStrictEqual(new Date('2021'));
    expect(getValue('1609459200', 'timestamp_epoch_s')).toStrictEqual(new Date('2021'));
    expect(getValue(1609459200, 'timestamp_epoch_s')).toStrictEqual(new Date('2021'));
  });
});
