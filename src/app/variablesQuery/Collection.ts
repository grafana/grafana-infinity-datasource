import chunk from 'lodash/chunk';
import { SelectableValue } from '@grafana/data';

export const CollectionVariable = (query: string): Array<SelectableValue<string>> => {
  let out = chunk(query.split(','), 2).map(value => {
    return {
      text: value[0],
      value: value[1],
    };
  });
  return out;
};
