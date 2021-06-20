import React from 'react';
import { Select } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';
import { InfinityQuery, GlobalInfinityQuery } from './../../../types';
interface SourceSelectorProps {
  query: InfinityQuery;
  instanceSettings: any;
  onChange: (e: InfinityQuery) => void;
}
export const GlobalQuerySelector = (props: SourceSelectorProps) => {
  const { query, onChange, instanceSettings } = props;
  let global_queries: SelectableValue[] = (instanceSettings?.jsonData?.global_queries || []).map(
    (q: GlobalInfinityQuery) => {
      return {
        label: q.name,
        value: q.id,
      };
    }
  );
  return (
    <>
      <label className={`gf-form-label query-keyword width-4`}>Source</label>
      {global_queries.length > 0 ? (
        <Select
          options={global_queries}
          value={query.global_query_id}
          onChange={e => onChange({ ...query, global_query_id: e.value })}
        ></Select>
      ) : (
        <label className="gf-form-label width-8">No Queries found</label>
      )}
    </>
  );
};
