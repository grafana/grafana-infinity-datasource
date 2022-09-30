import React from 'react';
import { Select } from '@grafana/ui';
import { EditorField } from './../../../components/extended/EditorField';
import type { InfinityQuery } from './../../../types';

export const ParseTypeEditor = (props: { query: InfinityQuery; onChange: (value: any) => void; onRunQuery: () => void }) => {
  const { query, onChange, onRunQuery } = props;
  if (query.type === 'json' || query.type === 'graphql') {
    return (
      <EditorField label="Parser">
        <Select<typeof query.parser>
          value={query.parser || 'simple'}
          options={[
            { value: 'simple', label: 'Default' },
            { value: 'backend', label: 'Backend' },
            // { value: 'sqlite', label: 'SQLite' },
            { value: 'uql', label: 'UQL' },
            { value: 'groq', label: 'GROQ' },
          ]}
          onChange={(e) => {
            if (query.parser === 'uql') {
              let uql = query.uql || 'parse-json';
              onChange({ ...query, parser: e.value, uql });
            } else if (query.parser === 'groq') {
              let groq = query.groq || '*';
              onChange({ ...query, parser: e.value, groq });
            } else if (query.parser === 'sqlite') {
              let sqlite_query = query.sqlite_query || 'SELECT * FROM input';
              onChange({ ...query, parser: e.value, sqlite_query });
            } else {
              onChange({ ...query, parser: e.value });
            }
            onRunQuery();
          }}
        ></Select>
      </EditorField>
    );
  }
  if (query.type === 'csv' || query.type === 'tsv') {
    return (
      <EditorField label="Parser">
        <Select<typeof query.parser>
          value={query.parser || 'simple'}
          options={[
            { value: 'simple', label: 'Default' },
            { value: 'backend', label: 'Backend' },
            { value: 'uql', label: 'UQL' },
          ]}
          onChange={(e) => {
            let uql = query.uql || '';
            if (query.type === 'csv' && !query.uql) {
              uql = `parse-csv`;
            }
            if (query.type === 'tsv' && !query.uql) {
              uql = `parse-csv --delimiter "\t"`;
            }
            onChange({ ...query, parser: e?.value || 'simple', uql });
            onRunQuery();
          }}
        ></Select>
      </EditorField>
    );
  }
  if (query.type === 'xml') {
    return (
      <EditorField label="Parser">
        <Select<typeof query.parser>
          value={query.parser || 'simple'}
          options={[
            { value: 'simple', label: 'Default' },
            { value: 'uql', label: 'UQL' },
          ]}
          onChange={(e) => {
            let uql = query.uql || '';
            if (query.type === 'xml' && !query.uql) {
              uql = `parse-xml`;
            }
            onChange({ ...query, parser: e?.value || 'simple', uql });
            onRunQuery();
          }}
        ></Select>
      </EditorField>
    );
  }
  return <></>;
};
