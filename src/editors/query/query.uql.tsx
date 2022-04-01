import React from 'react';
import { InlineFormLabel, CodeEditor, CodeEditorSuggestionItem, Icon, CodeEditorSuggestionItemKind } from '@grafana/ui';
import { InfinityQuery, EditorMode } from '../../types';
declare const monaco: any;

export const UQLEditor = (props: { mode: EditorMode; query: InfinityQuery; onChange: (value: InfinityQuery) => void; onRunQuery: () => void }) => {
  const { query, mode, onChange, onRunQuery } = props;
  const LABEL_WIDTH = mode === 'variable' ? 10 : 8;
  const onUQLChange = (uql: string) => {
    if (query.type === 'uql') {
      onChange({ ...query, uql });
      onRunQuery();
    }
  };
  const handleMount = (editor: any) => registerUQL(editor);
  const getUQLSuggestions = (): CodeEditorSuggestionItem[] => {
    return [
      ...UQLKeyWords.map((item: string) => ({ label: item, kind: CodeEditorSuggestionItemKind.Method })),
      ...UQLFunctions.map((item: string) => ({ label: item, kind: CodeEditorSuggestionItemKind.Method })),
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
          onEditorDidMount={handleMount}
        />
        <Icon name="play" size="lg" style={{ color: 'greenyellow' }} onClick={() => {}} />
      </div>
    </>
  ) : (
    <></>
  );
};

async function registerUQL(editor: any) {
  editor.updateOptions({ fixedOverflowWidgets: true });
  monaco.languages.register({ id: 'uql' });
}

const UQLKeyWords = ['parse-json', 'parse-csv', 'parse-xml', 'parse-yaml', 'project', 'project-away', 'extend', 'scope', 'summarize', 'mv-expand', 'order by'];
const UQLFunctions = [
  'count',
  'sum',
  'diff',
  'mul',
  'div',
  'min',
  'max',
  'mean',
  'first',
  'last',
  'latest',
  'strcat',
  'dcount',
  'distinct',
  'random',
  'toupper',
  'tolower',
  'strlen',
  'trim',
  'trim_start',
  'trim_end',
  'toint',
  'tolong',
  'tonumber',
  'tobool',
  'tostring',
  'todouble',
  'tofloat',
  'parse_url',
  'parse_urlquery',
  'todatetime',
  'tounixtime',
  'unixtime_seconds_todatetime',
  'unixtime_nanoseconds_todatetime',
  'unixtime_milliseconds_todatetime',
  'unixtime_microseconds_todatetime',
  'format_datetime',
  'add_datetime',
  'startofminute',
  'startofhour',
  'startofday',
  'startofmonth',
  'startofweek',
  'startofyear',
];
