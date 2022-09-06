import { CodeEditor, Icon, InlineFormLabel } from '@grafana/ui';
import React from 'react';
import type { EditorMode, InfinityQuery } from './../../types';

export const GROQEditor = (props: { mode: EditorMode; query: InfinityQuery; onChange: (value: InfinityQuery) => void; onRunQuery: () => void }) => {
  const { query, mode, onChange, onRunQuery } = props;
  const LABEL_WIDTH = mode === 'variable' ? 10 : 8;
  const onGROQChange = (groq: string) => {
    if (query.type === 'groq') {
      onChange({ ...query, groq });
      onRunQuery();
    }
  };
  return query.type === 'groq' ? (
    <>
      <div className="gf-form">
        <InlineFormLabel className="query-keyword" width={LABEL_WIDTH}>
          GROQ Query
        </InlineFormLabel>
        <CodeEditor language="uql" width="594px" height="140px" value={query.groq} showMiniMap={false} showLineNumbers={false} getSuggestions={() => []} onSave={onGROQChange} onBlur={onGROQChange} />
        <Icon name="play" size="lg" style={{ color: 'greenyellow' }} onClick={() => {}} />
      </div>
      <div className="gf-form">
        <p style={{ color: 'yellowgreen' }}>WARNING: GROQ query is in alpha</p>
      </div>
    </>
  ) : (
    <></>
  );
};
