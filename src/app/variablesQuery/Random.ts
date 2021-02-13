import sample from 'lodash/sample';
import { SelectableValue } from '@grafana/data';

export const RandomVariable = (query: string): Array<SelectableValue<string>> => {
  let out = sample(query.split(','));
  return [
    {
      value: out,
      text: out,
    },
  ];
};
