import { flatten, defaultsDeep } from 'lodash';
import { SelectableValue } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { CollectionVariable } from './Collection';
import { CollectionLookupVariable } from './CollectionLookup';
import { JoinVariable } from './Join';
import { RandomVariable } from './Random';
import { UnixTimeStampVariable } from './UnixTimeStamp';
import { isTableData, isDataFrame } from './../utils';
import { VariableQuery, DefaultInfinityQuery, MetricFindValue } from './../../types';

export const getTemplateVariablesFromResult = (res: any): MetricFindValue[] => {
  if (isDataFrame(res) && res.fields.length > 0) {
    let out: MetricFindValue[] = [];
    for (let index = 0; index < res.length; index++) {
      let text = res.fields[0].values.get(index);
      let value = res.fields.length === 2 ? res.fields[1].values.get(index) : text;
      out.push({ value, text });
    }
    return out;
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
      infinityQuery: defaultsDeep(query.infinityQuery, DefaultInfinityQuery),
    };
  } else {
    return {
      query: '',
      queryType: 'legacy',
      infinityQuery: defaultsDeep(query.infinityQuery, DefaultInfinityQuery),
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
