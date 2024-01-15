import { DataFrameView, SelectableValue } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { defaultsDeep, flatten } from 'lodash';
import { DefaultInfinityQuery } from './../../constants';
import { isDataFrame, isTableData } from './../utils';
import { CollectionVariable } from './Collection';
import { CollectionLookupVariable } from './CollectionLookup';
import { JoinVariable } from './Join';
import { RandomVariable } from './Random';
import { UnixTimeStampVariable } from './UnixTimeStamp';
import type { MetricFindValue, VariableQuery, VariableQueryInfinity } from './../../types';

export const getTemplateVariablesFromResult = (res: any): MetricFindValue[] => {
  if (isDataFrame(res) && res.fields.length > 0) {
    const view = new DataFrameView(res);
    return (view || []).map((item) => {
      const keys = Object.keys(item || {}) || [];
      if (keys.length >= 2 && keys.includes('__text') && keys.includes('__value')) {
        return { text: item['__text'], value: item['__value'] };
      } else if (keys.includes('__text')) {
        return { text: item['__text'], value: item['__text'] };
      } else if (keys.includes('__value')) {
        return { text: item['__value'], value: item['__value'] };
      } else if (keys.length === 2) {
        return { text: item[0], value: item[1] };
      } else {
        return { text: item[0], value: item[0] };
      }
    });
  } else if (isTableData(res) && res.columns.length > 0) {
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
      queryType: 'legacy',
      infinityQuery: {
        ...DefaultInfinityQuery,
        refId: 'variable',
      },
    };
  } else if (query && query.queryType) {
    return {
      ...query,
      infinityQuery: defaultsDeep((query as VariableQueryInfinity).infinityQuery, DefaultInfinityQuery),
    } as VariableQuery;
  } else {
    return {
      query: '',
      queryType: 'legacy',
    };
  }
};

interface VariableProvider {
  query: () => Promise<Array<SelectableValue<string>>>;
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
