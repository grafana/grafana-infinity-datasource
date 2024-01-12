import { CollectionVariable } from './Collection';
import type { SelectableValue } from '@grafana/data';

const data: Array<[string, string, Array<SelectableValue<string>>]> = [
  [
    'it should return correct kv pairs and remove the variable keyword',
    'Collection(prod,pd,nonprod,np)',
    [
      { value: 'pd', text: 'prod' },
      { value: 'np', text: 'nonprod' },
    ],
  ],
  [
    'it should return correct kv pairs when even number of args passed',
    'prod,pd,nonprod,np',
    [
      { value: 'pd', text: 'prod' },
      { value: 'np', text: 'nonprod' },
    ],
  ],
  [
    'it should return correct kv pairs when value is missing',
    'prod,pd,nonprod,',
    [
      { value: 'pd', text: 'prod' },
      { value: 'nonprod', text: 'nonprod' },
    ],
  ],
  [
    'it should return correct kv pairs when odd number of args passed',
    'prod,pd,nonprod',
    [
      { value: 'pd', text: 'prod' },
      { value: 'nonprod', text: 'nonprod' },
    ],
  ],
];
describe('Collection', () => {
  it.each(data)('%s', (name, input, output) => {
    let got = CollectionVariable(input);
    expect(got.length).toBe(output.length);
    output.forEach((o, index) => {
      expect(got[index].value).toBe(o.value);
      expect(got[index].text).toBe(o.text);
    });
  });
});
