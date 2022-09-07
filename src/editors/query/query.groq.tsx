import { CodeEditor } from '@grafana/ui';
import React from 'react';
import { EditorField } from './../../components/extended/EditorField';
import type { InfinityQuery } from './../../types';

export const GROQEditor = (props: { query: InfinityQuery; onChange: (value: InfinityQuery) => void; onRunQuery: () => void }) => {
  const { query, onChange, onRunQuery } = props;
  const onGROQChange = (groq: string) => {
    if (query.type === 'groq' || (query.type === 'json' && query.parser === 'groq')) {
      onChange({ ...query, groq });
      onRunQuery();
    }
  };
  return query.type === 'groq' || (query.type === 'json' && query.parser === 'groq') ? (
    <>
      <EditorField label="GROQ Query" tooltip={'GROQ Query'}>
        <CodeEditor
          language="uql"
          width="680px"
          height="140px"
          value={query.groq || ''}
          showMiniMap={false}
          showLineNumbers={false}
          getSuggestions={() => []}
          onSave={onGROQChange}
          onBlur={onGROQChange}
        />
      </EditorField>
      <div className="gf-form">
        <p style={{ color: 'yellowgreen' }}>WARNING: GROQ query is in alpha</p>
      </div>
    </>
  ) : (
    <></>
  );
};
