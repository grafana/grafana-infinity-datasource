import React from 'react';
import { Select } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';
import { InfinityQuery, GlobalInfinityQuery } from '../types';
interface SourceSelectorProps {
  query: InfinityQuery;
  instanceSettings: any;
  onChange: (e: InfinityQuery) => void;
  onRunQuery: () => void;
}
export const GlobalQuerySelector = (props: SourceSelectorProps) => {
  const { query, onChange, onRunQuery, instanceSettings } = props;
  const global_queries: SelectableValue[] = (instanceSettings?.jsonData?.global_queries || []).map(
    (q: GlobalInfinityQuery) => {
      return {
        label: q.name,
        value: q.id,
      };
    }
  );
  const onGlobalQueryIDChange = (global_query_id: string) => {
    onChange({ ...query, global_query_id });
    onRunQuery();
  };
  return (
    <>
      <label className={`gf-form-label query-keyword width-4`}>Source</label>
      {global_queries.length > 0 ? (
        <div className="select-wrapper">
          <Select
            options={global_queries}
            value={query.global_query_id}
            onChange={(e) => onGlobalQueryIDChange(e.value)}
          ></Select>
        </div>
      ) : (
        <label className="gf-form-label width-8">No Queries found</label>
      )}
    </>
  );
};
