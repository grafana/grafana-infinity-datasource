import { ScrapColumn, ScrapColumnFormat } from './../../types';

const guessColumnTypeFromField = (obj: any): ScrapColumnFormat => {
  switch (typeof obj) {
    case 'number':
      return ScrapColumnFormat.Number;
    case 'string':
    default:
      return ScrapColumnFormat.String;
  }
};

export const getColumnsFromObjectArray = (result: any): ScrapColumn[] => {
  if (result) {
    return Object.keys(result).map((key) => {
      return { selector: key, text: key, type: guessColumnTypeFromField(result[key]) };
    });
  } else {
    return [];
  }
};
export const normalizeColumns = (columns: ScrapColumn[]): ScrapColumn[] => {
  return [...columns].map((c) => {
    c.text = c.text || c.selector;
    return c;
  });
};
