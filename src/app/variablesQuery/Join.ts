import { SelectableValue } from '@grafana/data';

export const JoinVariable = (query: string): Array<SelectableValue<string>> => {
  let out = query.split(',').join('');
  return [
    {
      value: out,
      text: out,
    },
  ];
};
