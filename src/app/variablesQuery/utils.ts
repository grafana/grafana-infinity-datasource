import { VariableTokenLegacy } from './../../types';

export const replaceTokenFromVariable = (query: string, token: VariableTokenLegacy): string => {
  return query.startsWith(`${token}(`) && query.endsWith(')') ? query.replace(`${token}(`, '').slice(0, -1) : query;
};
