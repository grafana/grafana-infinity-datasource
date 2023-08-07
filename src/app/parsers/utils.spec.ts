import { getValue } from './utils';

describe('utils', () => {
  it('getValue', () => {
    expect(getValue('', 'string')).toStrictEqual('');
    expect(getValue('hello 123', 'string')).toStrictEqual('hello 123');
    expect(getValue(123, 'string')).toStrictEqual('123');
    expect(getValue(0, 'string')).toStrictEqual('0');
    expect(getValue(null, 'string')).toStrictEqual(null);
    expect(getValue('1.234e2', 'string')).toStrictEqual('1.234e2');
    expect(getValue('1.234E2', 'string')).toStrictEqual('1.234E2');
    expect(getValue('1.234e-2', 'string')).toStrictEqual('1.234e-2');
    expect(getValue('1.234E-2', 'string')).toStrictEqual('1.234E-2');
    expect(getValue('192.168.0.1', 'string')).toStrictEqual(`192.168.0.1`);
    expect(getValue(1.234e2, 'string')).toStrictEqual('123.4');
    expect(getValue(1.234e2, 'string')).toStrictEqual('123.4');
    expect(getValue(1.234e-2, 'string')).toStrictEqual('0.01234');
    expect(getValue(1.234e-2, 'string')).toStrictEqual('0.01234');

    expect(getValue(123.45, 'number')).toStrictEqual(123.45);
    expect(getValue('123', 'number')).toStrictEqual(123);
    expect(getValue('-123', 'number')).toStrictEqual(-123);
    expect(getValue('-123.405', 'number')).toStrictEqual(-123.405);
    expect(getValue('123.45', 'number')).toStrictEqual(123.45);
    expect(getValue('1,234.5', 'number')).toStrictEqual(1234.5);
    expect(getValue('1,234.5abcdef:;!@#$$%^&*()ABCDEF', 'number')).toStrictEqual(1234.5);
    expect(getValue(' 01,234.5 ', 'number')).toStrictEqual(1234.5);
    expect(getValue('', 'number')).toStrictEqual(null);
    expect(getValue(null, 'number')).toStrictEqual(null);
    expect(getValue('192.168.0.1', 'number')).toStrictEqual(192.168);
    expect(getValue('1.234e2', 'number')).toStrictEqual(123.4);
    expect(getValue('1.234E2', 'number')).toStrictEqual(123.4);
    expect(getValue('1.234e-2', 'number')).toStrictEqual(0.01234);
    expect(getValue('1.234E-2', 'number')).toStrictEqual(0.01234);
    expect(getValue(1.234e2, 'number')).toStrictEqual(123.4);
    expect(getValue(1.234e2, 'number')).toStrictEqual(123.4);
    expect(getValue(1.234e-2, 'number')).toStrictEqual(0.01234);
    expect(getValue(1.234e-2, 'number')).toStrictEqual(0.01234);

    expect(getValue(true, 'boolean')).toStrictEqual(true);
    expect(getValue(false, 'boolean')).toStrictEqual(false);
    expect(getValue('true', 'boolean')).toStrictEqual(true);
    expect(getValue('false', 'boolean')).toStrictEqual(false);
    expect(getValue('123', 'boolean')).toStrictEqual(false);
    expect(getValue('-123', 'boolean')).toStrictEqual(false);
    expect(getValue(123, 'boolean')).toStrictEqual(true);
    expect(getValue(-123, 'boolean')).toStrictEqual(false);

    expect(getValue('2021', 'timestamp')).toStrictEqual(new Date('2021'));
    expect(getValue('2021-SEP-20', 'timestamp')).toStrictEqual(new Date('2021-SEP-20'));
    expect(getValue('1609459200000', 'timestamp_epoch')).toStrictEqual(new Date('2021'));
    expect(getValue(1609459200000, 'timestamp_epoch')).toStrictEqual(new Date('2021'));
    expect(getValue('1609459200', 'timestamp_epoch_s')).toStrictEqual(new Date('2021'));
    expect(getValue(1609459200, 'timestamp_epoch_s')).toStrictEqual(new Date('2021'));
  });
});
