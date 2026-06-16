import { replaceTokenFromVariable } from '@/app/variablesQuery/utils';
import type { SelectableValue } from '@grafana/data';

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
