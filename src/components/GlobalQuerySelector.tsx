import React from 'react';
import { Select } from '@grafana/ui';
import { EditorField } from './extended/EditorField';
import type { GlobalInfinityQuery, InfinityQuery } from './../types';
import type { SelectableValue } from '@grafana/data';

export const GlobalQuerySelector = (props: { query: InfinityQuery; instanceSettings: any; onChange: (e: InfinityQuery) => void; onRunQuery: () => void }) => {
  const { query, onChange, onRunQuery, instanceSettings } = props;
  if (query.type !== 'global') {
    return <></>;
  }
  const global_queries: SelectableValue[] = (instanceSettings?.jsonData?.global_queries || []).map((q: GlobalInfinityQuery) => {
    return {
      label: q.name,
      value: q.id,
    };
  });
  const onGlobalQueryIDChange = (global_query_id: string) => {
    onChange({ ...query, global_query_id });
    onRunQuery();
  };
  return (
    <>
      <EditorField label="Source">
        {global_queries.length > 0 ? (
          <div style={{ marginRight: '5px' }}>
            <Select options={global_queries} value={query.global_query_id} onChange={(e) => onGlobalQueryIDChange(e.value as string)} menuShouldPortal={true}></Select>
          </div>
        ) : (
          <label className="gf-form-label width-8">No Queries found</label>
        )}
      </EditorField>
    </>
  );
};
