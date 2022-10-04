import React from 'react';
import { CodeEditor } from '@grafana/ui';
import { EditorField } from './../../components/extended/EditorField';
import { EditorRow } from './../../components/extended/EditorRow';
import { isDataQuery } from './../../app/utils';
import type { InfinityQuery } from './../../types';

export const InlineDataEditor = ({ query, onChange, onRunQuery }: { query: InfinityQuery; onChange: (value: InfinityQuery) => void; onRunQuery: () => void }) => {
  const onDataChange = (data: string) => {
    if (isDataQuery(query) && query.source === 'inline') {
      onChange({ ...query, data });
      onRunQuery();
    }
  };
  if (isDataQuery(query) && query.source === 'inline') {
    return (
      <EditorRow>
        <EditorField label="Data" tooltip={'Inline Data'}>
          <CodeEditor
            language={query.type === 'csv' || query.type === 'tsv' ? 'csv' : query.type === 'json' || query.type === 'graphql' ? 'json' : query.type === 'xml' ? 'xml' : 'txt'}
            width="680px"
            height="140px"
            value={query.data || ''}
            showMiniMap={false}
            showLineNumbers={false}
            onSave={onDataChange}
            onBlur={onDataChange}
            data-testid="infinity-query-inline-data-selector"
          />
        </EditorField>
      </EditorRow>
    );
  }
  return <></>;
};
