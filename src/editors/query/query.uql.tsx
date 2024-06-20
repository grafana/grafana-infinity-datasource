import { CodeEditor, CodeEditorSuggestionItem, CodeEditorSuggestionItemKind, Icon } from '@grafana/ui';
import React from 'react';
import { EditorField } from './../../components/extended/EditorField';
import type { InfinityQuery } from './../../types';
declare const monaco: any;

const UQLTips: string[] = [
  '💡 While editing UQL, you can press ctrl+s/cmd+s to run the query',
  '💡 You can use `project kv()` command to transform key value pair/object into array',
  '💡 You can use `mv-expand "column_name"` command to expand the nested array',
  '💡 You can prefix each line with # to mark that as a comment',
];

export const UQLEditor = (props: { query: InfinityQuery; onChange: (value: InfinityQuery) => void; onRunQuery: () => void }) => {
  const { query, onChange, onRunQuery } = props;
  const onUQLChange = (uql: string) => {
    if (query.type === 'uql' || ((query.type === 'json' || query.type === 'csv' || query.type === 'tsv' || query.type === 'graphql' || query.type === 'xml') && query.parser === 'uql')) {
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
  return query.type === 'uql' || ((query.type === 'json' || query.type === 'csv' || query.type === 'tsv' || query.type === 'graphql' || query.type === 'xml') && query.parser === 'uql') ? (
    <EditorField label="">
      <div className="gf-form">
        <div data-testid="infinity-query-uql-selector">
          <CodeEditor
            language="sql"
            width="680px"
            height="140px"
            value={query.uql || ''}
            showMiniMap={false}
            showLineNumbers={false}
            getSuggestions={getUQLSuggestions}
            onSave={onUQLChange}
            onBlur={onUQLChange}
            onEditorDidMount={handleMount}
          />
          <span style={{ color: 'yellowgreen' }}>{UQLTips[Math.floor(Math.random() * UQLTips.length)]}</span>
        </div>
        <div title="Alternatively, you can also press ctrl+s ">
          <Icon
            name="play"
            size="lg"
            style={{ color: 'greenyellow' }}
            onClick={() => {
              onRunQuery();
            }}
          />
        </div>
      </div>
    </EditorField>
  ) : (
    <></>
  );
};

async function registerUQL(editor: any) {
  try {
    editor.updateOptions({ fixedOverflowWidgets: true });
    const allLangs = monaco.languages.getLanguages();
    const { language: uqlLang } = await allLangs.find(({ id }: any) => id === 'sql').loader();
    // eslint-disable-next-line no-prototype-builtins
    if (!uqlLang.hasOwnProperty('keywords')) {
      uqlLang.keywords = [];
    }
    uqlLang.keywords.unshift.apply(uqlLang.keywords, UQLKeyWords);
    // eslint-disable-next-line no-prototype-builtins
    if (!uqlLang.hasOwnProperty('builtinFunctions')) {
      uqlLang.builtinFunctions = [];
    }
    uqlLang.builtinFunctions.unshift.apply(uqlLang.builtinFunctions, UQLFunctions);
  } catch (ex) {
    console.error('error while loading monaco editor', ex);
  }
}

const UQLKeyWords = ['parse-json', 'parse-csv', 'parse-xml', 'parse-yaml', 'project', 'project-away', 'project kv()', 'jsonata', 'extend', 'scope', 'summarize', 'mv-expand', 'order by', 'where'];
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
  'countif',
  'sumif',
  'minif',
  'maxif',
  'strcat',
  'dcount',
  'distinct',
  'random',
  'kv',
  'btoa',
  'atob',
  'substring',
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
