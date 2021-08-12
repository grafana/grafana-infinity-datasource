import { flatten, defaultsDeep } from 'lodash';
import { SelectableValue } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { InfinityProvider } from './../InfinityProvider';
import { IsValidInfinityQuery, replaceVariables } from '../queryUtils';
import {
  InfinityQuery,
  InfinityInstanceSettings,
  VariableQuery,
  VariableQueryType,
  DefaultInfinityQuery,
} from './../../types';
import { CollectionVariable } from './Collection';
import { CollectionLookupVariable } from './CollectionLookup';
import { JoinVariable } from './Join';
import { RandomVariable } from './Random';
import { UnixTimeStampVariable } from './UnixTimeStamp';
import { Datasource } from './../../datasource';

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
      return flatten(res.rows || []).map((res) => {
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

export const migrateLegacyQuery = (query: VariableQuery | string): VariableQuery => {
  if (typeof query === 'string') {
    return {
      query: query,
      queryType: VariableQueryType.Legacy,
      infinityQuery: {
        ...DefaultInfinityQuery,
        refId: 'variable',
      },
    };
  } else if (query && query.queryType) {
    return {
      ...query,
      infinityQuery: defaultsDeep(query.infinityQuery, DefaultInfinityQuery),
    };
  } else {
    return {
      query: '',
      queryType: VariableQueryType.Legacy,
      infinityQuery: defaultsDeep(query.infinityQuery, DefaultInfinityQuery),
    };
  }
};

interface VariableProvider {
  query: () => Promise<Array<SelectableValue<string>>>;
}

export class InfinityVariableProvider implements VariableProvider {
  infinityQuery: InfinityQuery;
  instanceSettings: InfinityInstanceSettings;
  constructor(
    infinityQuery: InfinityQuery,
    instanceSettings: InfinityInstanceSettings,
    private datasource: Datasource
  ) {
    this.infinityQuery = infinityQuery;
    this.instanceSettings = instanceSettings;
  }
  query(): Promise<Array<SelectableValue<string>>> {
    return new Promise((resolve, reject) => {
      if (IsValidInfinityQuery(this.infinityQuery)) {
        let provider = new InfinityProvider(replaceVariables(this.infinityQuery, {}), this.datasource);
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
          .catch((ex) => {
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
    return new Promise((resolve) => {
      if (this.queryString.startsWith('Collection(') && this.queryString.endsWith(')')) {
        resolve(CollectionVariable(this.queryString));
      } else if (this.queryString.startsWith('CollectionLookup(') && this.queryString.endsWith(')')) {
        resolve(CollectionLookupVariable(this.queryString));
      } else if (this.queryString.startsWith('Join(') && this.queryString.endsWith(')')) {
        resolve(JoinVariable(this.queryString));
      } else if (this.queryString.startsWith('Random(') && this.queryString.endsWith(')')) {
        resolve(RandomVariable(this.queryString));
      } else if (this.queryString.startsWith('UnixTimeStamp(') && this.queryString.endsWith(')')) {
        resolve(UnixTimeStampVariable(this.queryString));
      } else {
        resolve([]);
      }
    });
  }
}
