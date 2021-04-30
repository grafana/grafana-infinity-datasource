import sample from 'lodash/sample';
import { SelectableValue } from '@grafana/data';
import { replaceTokenFromVariable } from './utils';

export const RandomVariable = (query: string): Array<SelectableValue<string>> => {
  query = replaceTokenFromVariable(query, 'Random');
  let out = sample(query.split(','));
  return [
    {
      value: out,
      text: out,
    },
  ];
};
