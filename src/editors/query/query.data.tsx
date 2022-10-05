import React from 'react';
import { EditorField } from './../../components/extended/EditorField';
import { EditorRow } from './../../components/extended/EditorRow';
import { isDataQuery } from './../../app/utils';
import type { InfinityQuery } from './../../types';

export const InlineDataEditor = ({ query, onChange, onRunQuery }: { query: InfinityQuery; onChange: (value: InfinityQuery) => void; onRunQuery: () => void }) => {
  const onDataChange = (data: string) => {
    if (isDataQuery(query) && query.source === 'inline') {
      onChange({ ...query, data });
    }
  };
  if (isDataQuery(query) && query.source === 'inline') {
    return (
      <EditorRow>
        <EditorField label="Data" tooltip={'Inline Data'}>
          <textarea
            rows={5}
            className="gf-form-input"
            style={{ width: '680px' }}
            value={query.data}
            placeholder=""
            onBlur={onRunQuery}
            onChange={(e) => onDataChange(e.currentTarget.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.altKey || e.metaKey) && e.key === 's') {
                onRunQuery();
                e.preventDefault();
              }
            }}
            data-testid="infinity-query-inline-data-selector"
          />
        </EditorField>
      </EditorRow>
    );
  }
  return <></>;
};
