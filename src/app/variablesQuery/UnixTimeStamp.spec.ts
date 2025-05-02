import { getFormatAndTimeShift, relativeTimeStampParse, shiftTime } from '@/app/variablesQuery/UnixTimeStamp';

describe('getFormatAndTimeShift', () => {
  it('getFormatAndTimeShift', () => {
    expect(getFormatAndTimeShift([]).format).toBe('ms');
    expect(getFormatAndTimeShift([]).timeShift).toBe('');
    expect(getFormatAndTimeShift(['s']).format).toBe('s');
    expect(getFormatAndTimeShift([]).timeShift).toBe('');
    expect(getFormatAndTimeShift(['ms']).format).toBe('ms');
    expect(getFormatAndTimeShift([]).timeShift).toBe('');
    expect(getFormatAndTimeShift(['10d', 's']).format).toBe('s');
    expect(getFormatAndTimeShift(['10d', 's']).timeShift).toBe('10d');
    // expect(getFormatAndTimeShift(['10d']).format).toBe('ms'); // error
    expect(getFormatAndTimeShift(['10d']).timeShift).toBe('10d');
  });
});

describe('relativeTimeStampParse', () => {
  it('relativeTimeStampParse test', () => {
    expect(relativeTimeStampParse('30d').value).toBe(30);
    expect(relativeTimeStampParse('30d').key).toBe('d');
    expect(relativeTimeStampParse('-12M').value).toBe(-12);
    expect(relativeTimeStampParse('-12M').key).toBe('M');
    expect(relativeTimeStampParse('h').value).toBe(1);
    expect(relativeTimeStampParse('h').key).toBe('h');
    expect(relativeTimeStampParse('-h').value).toBe(-1);
    expect(relativeTimeStampParse('-h').key).toBe('h');
  });
});

const currentDate = new Date('2021-07-31T00:00:00.000Z').getTime();
describe('shiftTime', () => {
  it('shiftTime', () => {
    expect(new Date(shiftTime(currentDate, '')).toDateString()).toBe(new Date(currentDate).toDateString());
    expect(new Date(shiftTime(currentDate, '0d')).toDateString()).toBe(new Date(currentDate).toDateString());
    expect(new Date(shiftTime(currentDate, '-1d')).toDateString()).toBe(new Date('2021-Jul-30').toDateString());
    expect(new Date(shiftTime(currentDate, '1d')).toDateString()).toBe(new Date('2021-Aug-1').toDateString());
    expect(new Date(shiftTime(currentDate, 'd')).toDateString()).toBe(new Date('2021-Aug-1').toDateString());
    expect(new Date(shiftTime(currentDate, '12d')).toDateString()).toBe(new Date('2021-Aug-12').toDateString());
    expect(new Date(shiftTime(currentDate, '40d')).toDateString()).toBe(new Date('2021-Sep-9').toDateString());
    expect(new Date(shiftTime(currentDate, '-40d')).toDateString()).toBe(new Date('2021-Jun-21').toDateString());
    expect(new Date(shiftTime(currentDate, '-1h')).toISOString()).toBe(new Date('2021-07-30T23:00:00.000Z').toISOString());
    expect(new Date(shiftTime(currentDate, '1h')).toISOString()).toBe(new Date('2021-07-31T01:00:00.000Z').toISOString());
    expect(new Date(shiftTime(currentDate, '-1m')).toISOString()).toBe(new Date('2021-07-30T23:59:00.000Z').toISOString());
    expect(new Date(shiftTime(currentDate, '1m')).toISOString()).toBe(new Date('2021-07-31T00:01:00.000Z').toISOString());
    expect(new Date(shiftTime(currentDate, '-1s')).toISOString()).toBe(new Date('2021-07-30T23:59:59.000Z').toISOString());
    expect(new Date(shiftTime(currentDate, '1s')).toISOString()).toBe(new Date('2021-07-31T00:00:01.000Z').toISOString());
    expect(new Date(shiftTime(currentDate, '-1ms')).toISOString()).toBe(new Date('2021-07-30T23:59:59.999Z').toISOString());
    expect(new Date(shiftTime(currentDate, '1ms')).toISOString()).toBe(new Date('2021-07-31T00:00:00.001Z').toISOString());
  });
});
