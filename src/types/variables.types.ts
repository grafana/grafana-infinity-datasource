import type { InfinityQuery } from './query.types';

//#region Variable Query
export type VariableTokenLegacy = 'Collection' | 'CollectionLookup' | 'Random' | 'Join' | 'UnixTimeStamp';
export type VariableQueryType = 'legacy' | 'infinity' | 'random';
export type VariableQueryBase<T extends VariableQueryType> = { queryType: T };
export type VariableQueryLegacy = { query: string; infinityQuery?: InfinityQuery } & VariableQueryBase<'legacy'>;
export type VariableQueryInfinity = { infinityQuery: InfinityQuery; query?: string } & VariableQueryBase<'infinity'>;
export type VariableQueryRandom = { values: string[] } & VariableQueryBase<'random'>;
export type VariableQuery = VariableQueryLegacy | VariableQueryInfinity | VariableQueryRandom;
//#endregion
