import sample from 'lodash/sample';
import { replaceTokenFromVariable } from '@/app/variablesQuery/utils';
import type { SelectableValue } from '@grafana/data';

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
