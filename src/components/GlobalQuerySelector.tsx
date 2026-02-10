import React from 'react';
import { Combobox, type ComboboxOption } from '@grafana/ui';
import { EditorField } from '@/components/extended/EditorField';
import type { GlobalInfinityQuery, InfinityQuery } from '@/types';
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
            <Combobox options={global_queries as Array<ComboboxOption<string>>} value={query.global_query_id} onChange={(e) => onGlobalQueryIDChange(e.value as string)}></Combobox>
          </div>
        ) : (
          <label className="gf-form-label width-8">No Queries found</label>
        )}
      </EditorField>
    </>
  );
};
