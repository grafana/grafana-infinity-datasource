import React from 'react';
import { FileDropzone, TextArea } from '@grafana/ui';
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
      <EditorRow collapsible={true} title={() => 'Inline data'}>
        <EditorField label="Data" tooltip={'Inline Data'}>
          <TextArea
            rows={6}
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
        <EditorField label="">
          <div style={{ paddingBlockStart: '70px', paddingInline: '12px' }}>OR</div>
        </EditorField>
        <EditorField label="Upload" style={{ maxHeight: '160px', overflow: 'hidden' }} tooltip="Suitable for small files (less than 2MB)">
          <div style={{ width: '400px' }}>
            <FileDropzone
              options={{ multiple: false, maxFiles: 1 }}
              onLoad={(result) => {
                if (typeof result === 'string' && result) {
                  onChange({ ...query, data: result });
                  onRunQuery();
                }
              }}
            />
          </div>
        </EditorField>
      </EditorRow>
    );
  }
  return <></>;
};
