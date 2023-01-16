import React from 'react';
import { Input } from '@grafana/ui';
import { EditorField } from './../../../components/extended/EditorField';
import type { InfinityGSheetsQuery } from './../../../types';

export const GoogleSheetsEditor = ({ query, onChange, onRunQuery }: { query: InfinityGSheetsQuery; onChange: (value: InfinityGSheetsQuery) => void; onRunQuery: () => void }) => {
  return (
    <>
      <EditorField label="Sheet ID" horizontal={true}>
        <Input value={query.spreadsheet} width={40} onChange={(e) => onChange({ ...query, spreadsheet: e.currentTarget.value })} onBlur={onRunQuery} />
      </EditorField>
      <EditorField label="Sheet Name" optional={true} horizontal={true}>
        <Input value={query.sheetName} width={20} onChange={(e) => onChange({ ...query, sheetName: e.currentTarget.value })} onBlur={onRunQuery} />
      </EditorField>
      <EditorField label="Range" horizontal={true}>
        <Input value={query.range} width={20} onChange={(e) => onChange({ ...query, range: e.currentTarget.value })} onBlur={onRunQuery} />
      </EditorField>
    </>
  );
};
