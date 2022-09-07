import { CodeEditor } from '@grafana/ui';
import React from 'react';
import { EditorRow } from './../../components/extended/EditorRow';
import { EditorField } from './../../components/extended/EditorField';
import type { EditorMode, InfinityQuery } from './../../types';

export const GROQEditor = (props: { mode: EditorMode; query: InfinityQuery; onChange: (value: InfinityQuery) => void; onRunQuery: () => void }) => {
  const { query, onChange, onRunQuery } = props;
  const onGROQChange = (groq: string) => {
    if (query.type === 'groq') {
      onChange({ ...query, groq });
      onRunQuery();
    }
  };
  return query.type === 'groq' ? (
    <EditorRow>
      <EditorField label="GROQ Query" tooltip={'GROQ Query'}>
        <CodeEditor language="uql" width="680px" height="140px" value={query.groq} showMiniMap={false} showLineNumbers={false} getSuggestions={() => []} onSave={onGROQChange} onBlur={onGROQChange} />
      </EditorField>
      <div className="gf-form">
        <p style={{ color: 'yellowgreen' }}>WARNING: GROQ query is in alpha</p>
      </div>
    </EditorRow>
  ) : (
    <></>
  );
};
