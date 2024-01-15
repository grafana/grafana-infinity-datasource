import { CollectionLookupVariable } from './CollectionLookup';
import type { SelectableValue } from '@grafana/data';

const data: Array<[string, string, Array<SelectableValue<string>>]> = [
  ['it should return correct kv pairs and remove the variable keyword', 'CollectionLookup(prod,pd,nonprod,np,nonprod)', [{ value: 'np', text: 'np' }]],
  ['it should return correct kv pairs when even number of args passed', 'prod,pd,nonprod,np,nonprod', [{ value: 'np', text: 'np' }]],
  [
    'it should return correct kv pairs when more than one arg matched',
    'prod,pd,nonprod,np,nonprod,foo,nonprod',
    [
      { value: 'np', text: 'np' },
      { value: 'foo', text: 'foo' },
    ],
  ],
  ['it should return empty array when even number of args passed', 'prod,pd,nonprod,np', []],
  ['it should return empty array when no args matched', 'prod,pd,nonprod,np,foo', []],
];
describe('CollectionLookup', () => {
  it.each(data)('%s', (name, input, output) => {
    let got = CollectionLookupVariable(input);
    expect(got.length).toBe(output.length);
    output.forEach((o, index) => {
      expect(got[index].value).toBe(o.value);
      expect(got[index].text).toBe(o.text);
    });
  });
});
