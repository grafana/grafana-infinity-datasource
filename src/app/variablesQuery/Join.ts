import { SelectableValue } from '@grafana/data';
import { replaceTokenFromVariable } from './utils';

export const JoinVariable = (query: string): Array<SelectableValue<string>> => {
  query = replaceTokenFromVariable(query, 'Join');
  let out = query.split(',').join('');
  return out
    ? [
        {
          value: out,
          text: out,
        },
      ]
    : [];
};
