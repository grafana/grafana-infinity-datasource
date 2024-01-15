import { RandomVariable } from './Random';
import type { SelectableValue } from '@grafana/data';

const data: Array<[string, string, Array<SelectableValue<string>>]> = [
  [
    'it should return correct kv pairs and remove the variable keyword',
    'Random(a,b,c)',
    [
      { value: 'a', text: 'a' },
      { value: 'b', text: 'b' },
      { value: 'c', text: 'c' },
    ],
  ],
  [
    'it should return correct kv pairs and when no keyword passed',
    'a,b,c',
    [
      { value: 'a', text: 'a' },
      { value: 'b', text: 'b' },
      { value: 'c', text: 'c' },
    ],
  ],
  ['it should return empty array when no args passed', '', []],
];
describe('Random', () => {
  it.each(data)('%s', (name, input, output) => {
    let got = RandomVariable(input);
    if (output.length > 0) {
      expect(got.length).toBe(1);
      expect(output).toContainEqual(got[0]);
    }
  });
});
