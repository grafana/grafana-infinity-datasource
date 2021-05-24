import { VariableTokenLegacy } from './../../types';
import { replaceTokenFromVariable } from './utils';

const data: Array<[string, VariableTokenLegacy, string]> = [
  ['Collection(A,a,B,b)', 'Collection', 'A,a,B,b'],
  ['CollectionLookup(A,a,B,b,A)', 'CollectionLookup', 'A,a,B,b,A'],
  ['Random(A,a,B,b,A)', 'Random', 'A,a,B,b,A'],
  ['Join(A,a,B,b,A)', 'Join', 'A,a,B,b,A'],
  ['Something(A,a,B,b,A)', 'Join', 'Something(A,a,B,b,A)'],
];

data.forEach((item, index) => {
  describe('replaceTokenFromVariable', () => {
    it(`replaceTokenFromVariable ${index + 1} ${item[1]}`, () => {
      expect(replaceTokenFromVariable(item[0], item[1])).toBe(item[2]);
    });
  });
});
