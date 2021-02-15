import flatten from 'lodash/flatten';
import { SelectableValue } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { InfinityProvider } from './../InfinityProvider';
import { IsValidInfinityQuery, replaceVariables } from './../InfinityQuery';
import { InfinityQuery, VariableTokenLegacy, InfinityInstanceSettings } from './../../types';
import { CollectionVariable } from './Collection';
import { CollectionLookupVariable } from './CollectionLookup';
import { JoinVariable } from './Join';
import { RandomVariable } from './Random';

export const replaceTokenFromVariable = (query: string, token: VariableTokenLegacy): string => {
  return query.startsWith(`${token}(`) && query.endsWith(')') ? query.replace(`${token}(`, '').slice(0, -1) : query;
};

const getTemplateVariablesFromResult = (res: any): Array<SelectableValue<string>> => {
  if (res.columns && res.columns.length > 0) {
    if (res.columns.length === 2) {
      return res.rows.map((row: string[]) => {
        return {
          label: row[0],
          value: row[1],
          text: row[0],
        };
      });
    } else {
      return flatten(res.rows || []).map(res => {
        return {
          value: String(res),
          label: String(res),
          text: String(res),
        };
      });
    }
  } else {
    return [];
  }
};

interface VariableProvider {
  query: () => Promise<Array<SelectableValue<string>>>;
}

export class InfinityVariableProvider implements VariableProvider {
  infinityQuery: InfinityQuery;
  instanceSettings: InfinityInstanceSettings;
  constructor(infinityQuery: InfinityQuery, instanceSettings: InfinityInstanceSettings) {
    this.infinityQuery = infinityQuery;
    this.instanceSettings = instanceSettings;
  }
  query(): Promise<Array<SelectableValue<string>>> {
    return new Promise((resolve, reject) => {
      if (IsValidInfinityQuery(this.infinityQuery)) {
        let provider = new InfinityProvider(replaceVariables(this.infinityQuery, {}), this.instanceSettings);
        provider
          .query()
          .then((res: any) => {
            if (res && res.rows) {
              let results = getTemplateVariablesFromResult(res);
              resolve(results);
            } else {
              resolve([]);
            }
          })
          .catch(ex => {
            resolve([]);
          });
      } else {
        resolve([]);
      }
    });
  }
}

export class LegacyVariableProvider implements VariableProvider {
  queryString: string;
  constructor(query: string) {
    this.queryString = getTemplateSrv().replace(query);
  }
  query(): Promise<Array<SelectableValue<string>>> {
    return new Promise(resolve => {
      if (this.queryString.startsWith('Collection(') && this.queryString.endsWith(')')) {
        let query = replaceTokenFromVariable(this.queryString, 'Collection');
        resolve(CollectionVariable(query));
      } else if (this.queryString.startsWith('CollectionLookup(') && this.queryString.endsWith(')')) {
        let query = replaceTokenFromVariable(this.queryString, 'CollectionLookup');
        resolve(CollectionLookupVariable(query));
      } else if (this.queryString.startsWith('Join(') && this.queryString.endsWith(')')) {
        let query = replaceTokenFromVariable(this.queryString, 'Join');
        resolve(JoinVariable(query));
      } else if (this.queryString.startsWith('Random(') && this.queryString.endsWith(')')) {
        let query = replaceTokenFromVariable(this.queryString, 'Random');
        resolve(RandomVariable(query));
      } else {
        resolve([]);
      }
    });
  }
}
