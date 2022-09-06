import { JoinVariable } from './Join';
import type { SelectableValue } from '@grafana/data';

const data: Array<[string, string, Array<SelectableValue<string>>]> = [
  ['it should return correct kv pairs and remove the variable keyword', 'Join(a,b,c)', [{ value: 'abc', text: 'abc' }]],
  ['it should return correct kv pairs when no variable keyword passed', 'a,b,c', [{ value: 'abc', text: 'abc' }]],
  ['it should return empty array when no args passed', '', []],
];
describe('Join', () => {
  it.each(data)('%s', (name, input, output) => {
    let got = JoinVariable(input);
    expect(got.length).toBe(output.length);
    output.forEach((o, index) => {
      expect(got[index].value).toBe(o.value);
      expect(got[index].text).toBe(o.text);
    });
  });
});
