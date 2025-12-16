import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CustomVariableSupport, type DataQueryRequest, type MetricFindValue } from '@grafana/data';
import { VariableEditor } from '@/editors/variable.editor';
import { Datasource } from '@/datasource';
import type { VariableQuery } from '@/types';

export class InfinityVariableSupport extends CustomVariableSupport<Datasource, VariableQuery> {
  editor = VariableEditor;
  constructor(private datasource: Datasource) {
    super();
  }
  query(request: DataQueryRequest<VariableQuery>): Observable<{ data: MetricFindValue[] }> {
    const resultPromise = this.datasource.MetricFindQuery(request.targets[0], { scopedVars: request.scopedVars });
    return from(resultPromise).pipe(map((data) => ({ data })));
  }
}
