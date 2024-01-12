import { replaceTokenFromVariable } from './utils';
import type { SelectableValue } from '@grafana/data';

// UnixTimeStamp(30d) --> (current timestamp +30d) in ms
// UnixTimeStamp(-30d) --> (current timestamp -30d) in ms
// UnixTimeStamp(30h,s) --> (current timestamp +30h) in s
// UnixTimeStamp(-30d,ms) --> (current timestamp -30d) in ms
// UnixTimeStamp(s) --> current timestamp in s
// UnixTimeStamp() --> current timestamp in ms

export const relativeTimeStampParse = (input: string): { value: number; key: string } => {
  let numberParts = input.match(/[-\d]+/g) || ['1'];
  let textParts = input.match(/[A-Za-z]+/g) || ['h'];
  return {
    value: numberParts[0] === '-' ? -1 : +numberParts[0],
    key: textParts[0],
  };
};

export const shiftTime = (value: number, timeShift: string): number => {
  if (timeShift) {
    let relativeTimeStamp = relativeTimeStampParse(timeShift);
    switch (relativeTimeStamp.key) {
      case 'd':
        value = value + relativeTimeStamp.value * (HOURS * MINUTES * SECONDS * MILLISECONDS);
        break;
      case 'h':
        value = value + relativeTimeStamp.value * (MINUTES * SECONDS * MILLISECONDS);
        break;
      case 'm':
        value = value + relativeTimeStamp.value * (SECONDS * MILLISECONDS);
        break;
      case 's':
        value = value + relativeTimeStamp.value * MILLISECONDS;
        break;
      case 'ms':
        value = value + relativeTimeStamp.value;
        break;
      default:
        break;
    }
  }
  return value;
};

export const getFormatAndTimeShift = (args: string[]): { format: string; timeShift: string } => {
  return {
    format: args.length === 1 ? args[0] || 'ms' : args[1] || 'ms',
    timeShift: ['s', 'ms', 'seconds', 'milliseconds'].includes(args[0]) ? '' : args[0] || '',
  };
};

export const getCurrentTime = () => new Date().getTime();

const HOURS = 24;
const MINUTES = 60;
const SECONDS = 60;
const MILLISECONDS = 1000;

export const UnixTimeStampVariable = (query: string): Array<SelectableValue<string>> => {
  let value: number = getCurrentTime();
  let args = replaceTokenFromVariable(query, 'UnixTimeStamp').split(',');
  let format = getFormatAndTimeShift(args).format;
  let timeShift = getFormatAndTimeShift(args).timeShift;
  if (args[0] && !['s', 'ms', 'seconds', 'milliseconds'].includes(timeShift)) {
    value = shiftTime(value, timeShift);
  }
  switch (format) {
    case 'seconds':
    case 's':
      value = Math.round(value / 1000);
      break;
    case 'milliseconds':
    case 'ms':
    default:
  }
  return [
    {
      value: value.toString(),
      text: query,
    },
  ];
};
