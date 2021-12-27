import React from 'react';
import { InlineFormLabel, CodeEditor, CodeEditorSuggestionItem, Icon, CodeEditorSuggestionItemKind } from '@grafana/ui';
import { InfinityQuery, EditorMode } from '../../types';

export const UQLEditor = (props: { mode: EditorMode; query: InfinityQuery; onChange: (value: InfinityQuery) => void; onRunQuery: () => void }) => {
  const { query, mode, onChange, onRunQuery } = props;
  const LABEL_WIDTH = mode === 'variable' ? 10 : 8;
  const onUQLChange = (uql: string) => {
    if (query.type === 'uql') {
      onChange({ ...query, uql });
      onRunQuery();
    }
  };
  const getUQLSuggestions = (): CodeEditorSuggestionItem[] => {
    return [
      { label: 'project', kind: CodeEditorSuggestionItemKind.Method },
      { label: 'project-away', kind: CodeEditorSuggestionItemKind.Method },
    ];
  };
  return query.type === 'uql' ? (
    <>
      <div className="gf-form">
        <InlineFormLabel className="query-keyword" width={LABEL_WIDTH}>
          UQL
        </InlineFormLabel>
        <CodeEditor
          language="uql"
          width="594px"
          height="140px"
          value={query.uql}
          showMiniMap={false}
          showLineNumbers={false}
          getSuggestions={getUQLSuggestions}
          onSave={onUQLChange}
          onBlur={onUQLChange}
        />
        <Icon name="play" size="lg" style={{ color: 'greenyellow' }} onClick={() => {}} />
      </div>
      <div className="gf-form" style={{ color: 'yellowgreen' }}>
        Warning: UQL is in beta. Don&apos;t use it in production.
      </div>
    </>
  ) : (
    <></>
  );
};
