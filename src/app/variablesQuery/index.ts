import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { defaultsDeep, flatten } from 'lodash';
import { DataFrameView, DataQueryResponse, SelectableValue, CustomVariableSupport, type DataQueryRequest } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { Datasource } from '@/datasource';
import { DefaultInfinityQuery } from '@/constants';
import { isDataFrame, isTableData } from '@/app/utils';
import { CollectionVariable } from '@/app/variablesQuery/Collection';
import { CollectionLookupVariable } from '@/app/variablesQuery/CollectionLookup';
import { JoinVariable } from '@/app/variablesQuery/Join';
import { RandomVariable } from '@/app/variablesQuery/Random';
import { UnixTimeStampVariable } from '@/app/variablesQuery/UnixTimeStamp';
import { VariableEditor } from '@/editors/variable.editor';
import type { VariableQuery, VariableQueryInfinity, MetricFindValue } from '@/types';

export class InfinityVariableSupport extends CustomVariableSupport<Datasource, VariableQuery> {
  editor = VariableEditor;
  constructor(private datasource: Datasource) {
    super();
  }
  query(request: DataQueryRequest<VariableQuery>): Observable<DataQueryResponse> {
    const resultPromise = this.datasource.getVariableQueryValues(request.targets[0], { scopedVars: request.scopedVars });
    return from(resultPromise).pipe(map((data) => ({ data })));
  }
  getDefaultQuery() {
    return {
      refId: 'variable',
      queryType: 'infinity',
      infinityQuery: {
        type: 'csv',
        parser: 'backend',
        source: 'inline',
        data: 'values\nfoo\nbar\nbaz',
      },
    };
  }
}

export const TEXT_FIELD_SELECTOR_IN_VARIABLE = '__text';
export const VALUE_FIELD_SELECTOR_IN_VARIABLE = '__value';

export const getTemplateVariablesFromResult = (res: any): MetricFindValue[] => {
  if (isDataFrame(res) && res.fields.length > 0) {
    const view = new DataFrameView(res);
    return (view || []).map((item) => {
      const keys = Object.keys(item || {}) || [];
      if (keys.length >= 2 && keys.includes(TEXT_FIELD_SELECTOR_IN_VARIABLE) && keys.includes(VALUE_FIELD_SELECTOR_IN_VARIABLE)) {
        const { __text, __value, ...properties } = item;
        return { text: __text, value: __value, properties };
      } else if (keys.includes(TEXT_FIELD_SELECTOR_IN_VARIABLE)) {
        const { __text, ...properties } = item;
        return { text: __text, value: __text, properties };
      } else if (keys.includes(VALUE_FIELD_SELECTOR_IN_VARIABLE)) {
        const { __value, ...properties } = item;
        return { text: __value, value: __value, properties };
      } else if (keys.length === 2) {
        // NOTE: always consider first field as text, second field as value for backwards compatibility
        return { text: item[0], value: item[1], properties: {} };
      } else {
        // NOTE: consider first field for both text and value; remaining goes into properties
        const properties = Object.fromEntries(keys.slice(1).map((k) => [k, item[k]]));
        return { text: item[0], value: item[0], properties };
      }
    });
  } else if (isTableData(res) && res.columns.length > 0) {
    if (res.columns.length === 2) {
      return res.rows.map((row: string[]) => {
        return {
          value: row[1],
          text: row[0],
        };
      });
    } else {
      return flatten(res.rows || []).map((res) => {
        return {
          value: String(res),
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
      refId: 'variable',
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
      refId: 'variable',
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
