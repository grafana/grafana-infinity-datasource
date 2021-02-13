import flatten from 'lodash/flatten';
import { SelectableValue, DataSourceInstanceSettings } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { CollectionVariable } from './Collection';
import { CollectionLookupVariable } from './CollectionLookup';
import { JoinVariable } from './Join';
import { RandomVariable } from './Random';
import { InfinityProvider } from './../InfinityProvider';
import { InfinityQuery } from './../../types';
import { InfinityDataSourceJSONOptions } from './../../config.editor';
import { replaceVariables } from './../../utils';
import { reject } from 'lodash';

type VariableTokenLegacy = 'Collection' | 'CollectionLookup' | 'Random' | 'Join';

const replaceTokenFromVariable = (query: string, token: VariableTokenLegacy): string => {
  return query.replace(`${token}(`, '').slice(0, -1);
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
  instanceSettings: DataSourceInstanceSettings<InfinityDataSourceJSONOptions>;
  constructor(
    infinityQuery: InfinityQuery,
    instanceSettings: DataSourceInstanceSettings<InfinityDataSourceJSONOptions>
  ) {
    this.infinityQuery = infinityQuery;
    this.instanceSettings = instanceSettings;
  }
  query(): Promise<Array<SelectableValue<string>>> {
    return new Promise(resolve => {
      if (this.infinityQuery) {
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
            reject(ex);
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
