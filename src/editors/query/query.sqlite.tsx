import { CodeEditor } from '@grafana/ui';
import React from 'react';
import { EditorField } from '../../components/extended/EditorField';
import type { InfinityQuery } from '../../types';

export const SQLiteEditor = ({ query, onChange, onRunQuery }: { query: InfinityQuery; onChange: (value: InfinityQuery) => void; onRunQuery: () => void }) => {
  const onSQLiteQueryChange = (sqlite_query: string) => {
    if (query.type === 'json' && query.parser === 'sqlite') {
      onChange({ ...query, sqlite_query });
      onRunQuery();
    }
  };
  return query.type === 'json' && query.parser === 'sqlite' ? (
    <EditorField label="SQLite Query" tooltip={'SQLite Query'}>
      <CodeEditor
        language="sql"
        width="680px"
        height="140px"
        value={query.sqlite_query || ''}
        showMiniMap={false}
        showLineNumbers={false}
        getSuggestions={() => []}
        onSave={onSQLiteQueryChange}
        onBlur={onSQLiteQueryChange}
      />
    </EditorField>
  ) : (
    <></>
  );
};
