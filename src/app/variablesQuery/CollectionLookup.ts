import chunk from 'lodash/chunk';
import last from 'lodash/last';
import { SelectableValue } from '@grafana/data';
import { replaceTokenFromVariable } from './utils';

export const CollectionLookupVariable = (query: string): Array<SelectableValue<string>> => {
  query = replaceTokenFromVariable(query, 'CollectionLookup');
  let querySplit = query.split(',');
  let chunkCollection = chunk(querySplit, 2);
  let out = chunkCollection
    .slice(0, -1)
    .map(value => {
      return {
        key: value[0],
        value: value[1],
      };
    })
    .filter(v => {
      return v.key === last(querySplit);
    });
  return out && out.length > 0
    ? out.map(o => {
        return {
          value: o.value,
          text: o.value,
        };
      })
    : [];
};
