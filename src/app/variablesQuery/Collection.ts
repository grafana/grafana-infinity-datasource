import chunk from 'lodash/chunk';
import { SelectableValue } from '@grafana/data';
import { replaceTokenFromVariable } from './utils';

export const CollectionVariable = (query: string): Array<SelectableValue<string>> => {
  query = replaceTokenFromVariable(query, 'Collection');
  let out = chunk(query.split(','), 2).map(value => {
    return {
      text: value[0],
      value: value[1] || value[0],
    };
  });
  return out;
};
