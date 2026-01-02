import { from, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { defaultsDeep, sample } from 'lodash';
import { SelectableValue, CustomVariableSupport, type DataQueryRequest, DataQueryResponse, createDataFrame, FieldType, DataFrame, Field } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { Datasource } from '@/datasource';
import { DefaultInfinityQuery } from '@/constants';
import { migrateQuery } from '@/migrate';
import { interpolateQuery, interpolateVariableQuery } from '@/interpolate';
import { CollectionVariable } from '@/app/variablesQuery/Collection';
import { CollectionLookupVariable } from '@/app/variablesQuery/CollectionLookup';
import { JoinVariable } from '@/app/variablesQuery/Join';
import { RandomVariable } from '@/app/variablesQuery/Random';
import { UnixTimeStampVariable } from '@/app/variablesQuery/UnixTimeStamp';
import { VariableEditor } from '@/editors/variable.editor';
import type { VariableQuery, VariableQueryInfinity } from '@/types';

export class InfinityVariableSupport extends CustomVariableSupport<Datasource, VariableQuery> {
  editor = VariableEditor;
  constructor(private datasource: Datasource) {
    super();
  }
  query(request: DataQueryRequest<VariableQuery>): Observable<DataQueryResponse> {
    if (request.targets.length < 1) {
      throw new Error('no variable query found');
    }
    let query = migrateLegacyQuery(request.targets[0]);
    query = interpolateVariableQuery(query);
    const refId = query.refId || 'variable';
    switch (query.queryType) {
      case 'legacy':
        const legacyVariableProvider = new LegacyVariableProvider(query.query);
        return from(legacyVariableProvider.query()).pipe(
          map((values = []) => {
            const df = createDataFrame({
              refId,
              fields: [
                { name: 'value', values: values.map((item) => item.value), type: FieldType.string },
                { name: 'text', values: values.map((item) => item.text), type: FieldType.string },
              ],
            });
            return { data: [df] };
          })
        );
      case 'random':
        let value = query.values && query.values.length > 0 ? sample(query.values || []) || query.values[0] : new Date().getTime().toString();
        return of({
          data: [
            createDataFrame({
              refId,
              fields: [
                { name: 'value', values: [value], type: FieldType.string },
                { name: 'text', values: [value], type: FieldType.string },
              ],
            }),
          ],
        });
      case 'infinity':
      default:
        if (!query.infinityQuery) {
          throw new Error('no infinity variable query found');
        }
        const migratedQuery = migrateQuery(query.infinityQuery);
        const interpolatedTarget = interpolateQuery(migratedQuery, request.scopedVars || {});
        const query_request = { ...request, targets: [{ ...interpolatedTarget, refId }] };
        return this.datasource.query(query_request).pipe(
          map((d: DataQueryResponse) => {
            return {
              ...d,
              data: d.data.map((frame: DataFrame) => ({ ...frame, fields: convertOriginalFieldsToVariableFields(frame.fields) })),
            };
          })
        );
    }
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

export const convertOriginalFieldsToVariableFields = (original_fields: Array<Field<any>>): Array<Field<any>> => {
  let fields: Field[] = [];
  let tf = original_fields.find((f) => f.name === '__text');
  let vf = original_fields.find((f) => f.name === '__value');
  if (original_fields.length >= 2 && tf && vf) {
    fields = [
      { ...tf, name: 'text' },
      { ...vf, name: 'value' },
    ];
  } else if (tf) {
    fields = [
      { ...tf, name: 'text' },
      { ...tf, name: 'value' },
    ];
  } else if (vf) {
    fields = [
      { ...vf, name: 'text' },
      { ...vf, name: 'value' },
    ];
  } else if (original_fields.length === 2) {
    fields = [
      { ...original_fields[0], name: 'text' },
      { ...original_fields[1], name: 'value' },
    ];
  } else {
    fields = [
      { ...original_fields[0], name: 'text' },
      { ...original_fields[0], name: 'value' },
    ];
  }
  return fields;
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
